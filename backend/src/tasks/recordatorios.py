import random
from collections import defaultdict
from datetime import datetime, timedelta, date

from celery import shared_task

from django.utils import timezone
from django.utils.timezone import make_aware
from django.db import connections, transaction
from django.db.models import OuterRef, Subquery, Exists

from src.apps.turno.models import Turno
from src.apps.mensaje.models import Mensaje, EfeSerEspPlantilla
from src.utils.querys_informix import query_detalles_turno
from src.utils.parse import parse_date, parse_time, normalizar_telefono
from .utils import enviar_whatsapp, decode_res, token_url, ajustar_horario_envio, calcular_proximo_retry, decode_res_twilio, send_message_twilio, format_message_twilio
from src.apps.mensaje.services import check_turno, create_Mensaje, format_plantilla
from core.settings import SEND_TIME, BATCH_SIZE, BATCH_WINDOW_SECONDS, TZ


# ---------------------------------------------------------------------------
# Helpers — programar_recordatorios
# ---------------------------------------------------------------------------

def _get_turnos_candidatos(hoy: date) -> list:
    """
    Consulta Django ORM y retorna los turnos que potencialmente necesitan
    recordatorio en los próximos 5 días.
    """
    efp_qs = (
        EfeSerEspPlantilla.objects
        .filter(efe_ser_esp=OuterRef('efe_ser_esp'), recordatorio=1)
    )
    rango_fin = hoy + timedelta(days=5)

    qs = (
        Turno.objects
        .filter(estado=3, msj_recordatorio=0, fecha__range=(hoy, rango_fin))
        .annotate(
            efp_exists=Exists(efp_qs),
            plantilla_reco=Subquery(efp_qs.values('plantilla_reco')[:1]),
            dias_antes=Subquery(efp_qs.values('dias_antes')[:1]),
        )
        .filter(efp_exists=True)
        .order_by('fecha', 'hora')
        .values('id', 'id_sisr', 'efe_ser_esp', 'fecha', 'hora', 'dias_antes', 'plantilla_reco')
    )
    return list(qs)


def _filtrar_candidatos_hoy(turnos: list, hoy: date) -> list:
    """
    De todos los turnos pre-filtrados, queda solo con los que deben recibir
    recordatorio exactamente hoy (fecha_turno - dias_antes == hoy).
    """
    return [
        t for t in turnos
        if t['fecha'] - timedelta(days=int(t['dias_antes'] or 0)) == hoy
    ]


def _get_detalles_informix(turnos_ids: list) -> list:
    """
    Trae los detalles completos de una lista de id_sisr desde Informix.
    Retorna lista de filas o lista vacía.
    """
    if not turnos_ids:
        return []
    try:
        conn = connections['informix']
        with conn.cursor() as cur:
            cur.execute(query_detalles_turno(len(turnos_ids)), turnos_ids)
            return cur.fetchall()
    except Exception as ex:
        print(f"[ERROR] query_detalles_turno: {ex}")
        return []


def _calcular_eta(target_date: date, per_day_counter: dict, per_day_batches: dict) -> datetime:
    """
    Calcula el eta de envío para un turno dado, distribuyendo en batches
    con offsets aleatorios dentro de la ventana de envío del día.
    """
    base_naive = datetime.combine(target_date, SEND_TIME)
    send_dt = make_aware(base_naive, TZ)

    idx = per_day_counter[target_date]
    batch_index = idx // BATCH_SIZE
    pos_in_batch = idx % BATCH_SIZE
    batch_key = (target_date, batch_index)

    if batch_key not in per_day_batches:
        try:
            offsets = sorted(random.sample(range(BATCH_WINDOW_SECONDS), k=BATCH_SIZE))
        except ValueError:
            offsets = sorted(random.randint(0, BATCH_WINDOW_SECONDS - 1) for _ in range(BATCH_SIZE))
        per_day_batches[batch_key] = offsets

    offset = per_day_batches[batch_key][pos_in_batch]
    send_dt = send_dt + timedelta(seconds=(batch_index * BATCH_WINDOW_SECONDS + offset))

    if timezone.is_naive(send_dt):
        send_dt = make_aware(send_dt, TZ)

    send_dt = ajustar_horario_envio(send_dt)

    if timezone.is_naive(send_dt):
        send_dt = make_aware(send_dt, TZ)

    return send_dt


def _registrar_sin_telefono(id_local: int, id_efe_ser_esp) -> None:
    """Persiste un Mensaje con estado -3 cuando el turno no tiene teléfono válido."""
    turno_db = Turno.objects.filter(id=id_local).first()
    if not turno_db:
        return
    _, plantilla = check_turno(id_efe_ser_esp, 4)
    create_Mensaje(
        id=None,
        turno=turno_db,
        numero=None,
        plantilla=plantilla,
        estado=-3,
        fecha=timezone.now(),
        sesion=None,
    )


def _programar_fila(r: tuple, turnos_map: dict, per_day_counter: dict, per_day_batches: dict) -> None:
    """
    Procesa una fila de Informix: valida teléfono, calcula ETA y encola
    send_reminder_task. No lanza excepción — logea y retorna.
    """
    try:
        (
            id_turno, id_efector, id_servicio, id_especialidad,
            id_efe_ser_esp, tipo_doc, nro_doc,
            ape_pac, nom_pac, fecha_turno_inf, hora_turno_inf,
            ape_prof, nom_prof, nombre_servicio, nombre_especialidad,
            nombre_efector, calle, altura, letra, coordx, coordy,
            tel_efe, calle_nom, carac_tel, tel
        ) = r
    except Exception as ex:
        print(f"[WARN] Fila con longitud inesperada: {ex} -> {r}")
        return

    t_local = turnos_map.get(id_turno)
    if not t_local:
        print(f"[WARN] Sin turno local para id_turno={id_turno}")
        return

    id_local = t_local["id"]
    fecha_turno: date = t_local["fecha"]
    dias_antes = int(t_local.get("dias_antes") or 0)
    id_efe_ser_esp_local = t_local["efe_ser_esp"]

    telefono = normalizar_telefono(carac_tel, tel)
    if not telefono:
        print(f"[DEBUG] Teléfono inválido para turno {id_turno}")
        _registrar_sin_telefono(id_local, id_efe_ser_esp_local)
        return

    target_date = fecha_turno - timedelta(days=dias_antes)
    eta = _calcular_eta(target_date, per_day_counter, per_day_batches)
    per_day_counter[target_date] += 1

    now = datetime.now(TZ)
    eta = eta if eta > now else now + timedelta(seconds=5)

    try:
        args = list(map(str, r)) + [str(id_local)]
        send_reminder_task.apply_async(args=args, eta=eta)
        print(f"[INFO] Programado turno {id_turno} en {eta.isoformat()}")
    except Exception as ex:
        print(f"[ERROR] apply_async turno={id_turno}: {ex}")


# ---------------------------------------------------------------------------
# Helpers — send_reminder_task
# ---------------------------------------------------------------------------

def _armar_datos_plantilla(
    nom_pac, ape_pac, fecha_turno, hora_turno,
    nom_prof, ape_prof, nombre_especialidad, nombre_efector,
    nombre_servicio, calle, altura, letra, coordx, coordy,
    tel_efe, calle_nom, url,
) -> dict:
    d_fecha = parse_date(fecha_turno)
    d_hora  = parse_time(hora_turno)
    return {
        "nombre_pac":    nom_pac or "",
        "apellido_pac":  ape_pac or "",
        "fecha":         d_fecha.strftime("%d-%m-%Y"),
        "horaturno":     d_hora.strftime("%H:%M"),
        "nombre_prof":   nom_prof or "",
        "apellido_prof": ape_prof or "",
        "especialidad":  nombre_especialidad or "",
        "efector":       nombre_efector or "",
        "servicio":      nombre_servicio or "",
        "calle":         calle or "",
        "altura":        altura or "",
        "letra":         letra or "",
        "coordx":        coordx or "",
        "coordy":        coordy or "",
        "tel_efe":       tel_efe or "",
        "calle_nom":     calle_nom or "",
        "url":           url,
    }, d_fecha, d_hora


def _turno_valido_para_recordatorio(turno: Turno, id_efe_ser_esp, id_turno) -> tuple:
    """
    Verifica que el turno siga en condiciones de recibir recordatorio.
    Retorna (send_flag, plantilla) o (False, None) si no corresponde.
    """
    if turno.estado_id != 3 or turno.msj_recordatorio == 1:
        return False, None

    send_flag, plantilla = check_turno(id_efe_ser_esp, 4)
    if not send_flag or not plantilla:
        print(f"[DEBUG] check_turno: send={send_flag} plantilla={plantilla} turno={id_turno}")
        return False, None

    if Mensaje.objects.filter(turno=turno.id, plantilla__tipo__id=4).exists():
        print(f"[DEBUG] Mensaje ya enviado, abortando turno={id_turno}")
        return False, None

    return True, plantilla


def _marcar_recordatorio_enviado(turno: Turno, id_efector, id_servicio, id_especialidad) -> None:
    """Marca msj_recordatorio=1 y aplica lógica especial por servicio si corresponde."""
    turno.msj_recordatorio = 1
    turno.save(update_fields=["msj_recordatorio"])

    # Lógica especial: Cirugía General
    if int(id_efector) == 1 or int(id_efector) == 100:
        now = datetime.now()
        turno.estado_paciente_id = 4
        turno.fecha_estado_paciente = now
        turno.save(update_fields=["estado_paciente", "fecha_estado_paciente"])


# ---------------------------------------------------------------------------
# Tasks
# ---------------------------------------------------------------------------

@shared_task
def programar_recordatorios() -> None:
    print(f"[{timezone.now().isoformat()}] Ejecutando recordatorios...")

    try:
        hoy = datetime.now(TZ).date()

        turnos = _get_turnos_candidatos(hoy)
        if not turnos:
            print("No hay turnos candidatos para recordatorios.")
            return

        candidatos = _filtrar_candidatos_hoy(turnos, hoy)
        if not candidatos:
            print("Ningún turno requiere recordatorio hoy.")
            return

        turnos_ids = [t['id_sisr'] for t in candidatos]
        turnos_map = {t["id_sisr"]: t for t in candidatos}

        resultados = _get_detalles_informix(turnos_ids)
        if not resultados:
            print("Sin resultados desde Informix.")
            return

        per_day_counter = defaultdict(int)
        per_day_batches = {}

        for r in resultados:
            _programar_fila(r, turnos_map, per_day_counter, per_day_batches)

        print("Procesamiento de recordatorios completado.")

    except Exception as e:
        print(f"[ERROR] programar_recordatorios: {e}")


@shared_task(
    bind=True,
    max_retries=100,
)
def send_reminder_task(
    self,
    id_turno,
    id_efector, id_servicio, id_especialidad,
    id_efe_ser_esp, tipo_doc, nro_doc,
    ape_pac, nom_pac, fecha_turno, hora_turno,
    ape_prof, nom_prof, nombre_servicio, nombre_especialidad,
    nombre_efector, calle, altura, letra, coordx, coordy,
    tel_efe, calle_nom, carac_tel, tel,
    id,
):
    try:
        with transaction.atomic():
            turno = Turno.objects.select_for_update().get(id=id)

            ok, plantilla = _turno_valido_para_recordatorio(turno, id_efe_ser_esp, id_turno)
            if not ok:
                return

            telefono = normalizar_telefono(carac_tel, tel)
            if not telefono:
                return

            datos_plantilla, d_fecha, d_hora = _armar_datos_plantilla(
                nom_pac, ape_pac, fecha_turno, hora_turno,
                nom_prof, ape_prof, nombre_especialidad, nombre_efector,
                nombre_servicio, calle, altura, letra, coordx, coordy,
                tel_efe, calle_nom, token_url(turno.id),
            )

            now = datetime.now(TZ)
            turno_dt = make_aware(datetime.combine(d_fecha, d_hora), TZ)

            if now >= turno_dt:
                print(f"[INFO] Turno vencido, no se envía recordatorio: turno={id_turno}")
                return

            mensaje = format_plantilla(plantilla.contenido, datos_plantilla)

            # --- Intento de envío ---
            try:
                parameters = format_message_twilio(plantilla, datos_plantilla)
                res        = send_message_twilio(telefono, plantilla.content_sid, parameters)
                (envio_id, ack, fecha_msj, ins) = decode_res_twilio(res)
            except Exception as send_ex:
                # Error de red/API: reintentar si hay tiempo, sino abandonar
                print(f"[WARN] Error al enviar turno={id_turno}: {send_ex}")
                eta = calcular_proximo_retry(now)
                if eta < turno_dt:
                    print(f"[RETRY] turno={id_turno} por error de envío, próximo intento: {eta}")
                    raise self.retry(eta=eta)
                # Sin tiempo: registrar fallo definitivo
                print(f"[STOP] Sin tiempo para reintentar turno={id_turno}, registrando fallo.")
                create_Mensaje(
                    id=None, turno=turno, numero=telefono,
                    plantilla=plantilla, estado=-1, fecha=now, sesion=None,
                )
                return

            if ack in (-1, -5):
                eta = calcular_proximo_retry(now)
                if eta < turno_dt:
                    print(f"[RETRY] turno={id_turno} ack={ack}, próximo intento: {eta}")
                    raise self.retry(eta=eta)
                # Sin tiempo: registrar fallo definitivo
                print(f"[STOP] Sin tiempo para reintentar turno={id_turno} ack={ack}, registrando.")
                create_Mensaje(
                    id=envio_id, turno=turno, numero=telefono,
                    plantilla=plantilla, estado=ack, fecha=fecha_msj, sesion=ins,
                )
                return

            if ack < 0:
                # Fallo definitivo para cualquier otro código negativo
                print(f"[STOP] Fallo definitivo turno={id_turno} ack={ack}, registrando.")
                create_Mensaje(
                    id=envio_id, turno=turno, numero=telefono,
                    plantilla=plantilla, estado=ack, fecha=fecha_msj, sesion=ins,
                )
                return

            # --- Éxito ---
            create_Mensaje(
                id=envio_id, turno=turno, numero=telefono,
                plantilla=plantilla, estado=ack, fecha=fecha_msj, sesion=ins,
            )
            _marcar_recordatorio_enviado(turno, id_efector, id_servicio, id_especialidad)
            print(f"[OK] Recordatorio enviado turno={id_turno} ack={ack}")

    except self.MaxRetriesExceededError:
        print(f"[WARN] Max retries alcanzado turno={id_turno}")

    except Exception as e:
        print(f"[ERROR] send_reminder_task turno={id_turno}: {e}")