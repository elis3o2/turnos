from datetime import datetime, timedelta

from celery import shared_task

from django.utils import timezone
from django.utils.timezone import make_aware
from django.db import connections, transaction
from django.db.models import OuterRef, Subquery, Exists
from src.models import Turno, Mensaje, Flow, EfeSerEspPlantilla
from src.utils.querys_informix import query_detalles_turno
from src.utils.parse import parse_date, parse_time, normalizar_telefono
from utils import enviar_whatsapp, decode_res, token_url, ajustar_horario_envio, calcular_proximo_retry
from src.apps.mensaje.services import check_turno, create_Mensaje, format_plantilla
from core.settings import SEND_TIME, BATCH_SIZE, BATCH_WINDOW_SECONDS

@shared_task
def programar_recordatorios() -> None:
    print(f"[{timezone.now().isoformat()}] Ejecutando recordatorios...")

    try:
        hoy = datetime.now(TZ).date()

        efp_qs = (
            EfeSerEspPlantilla.objects
            .filter(
                id_efe_ser_esp=OuterRef('id_efe_ser_esp'),
                recordatorio=1
            )
        )

        rango_fin = hoy + timedelta(days=5)

        turnos_qs = (
            Turno.objects
            .filter(id_estado=3, msj_recordatorio=0, fecha__range=(hoy, rango_fin))
            .annotate(
                efp_exists=Exists(efp_qs),
                plantilla_reco=Subquery(efp_qs.values('plantilla_reco')[:1]),
                dias_antes=Subquery(efp_qs.values('dias_antes')[:1]),
            )
            .filter(efp_exists=True)
            .order_by('fecha', 'hora')
            .values(
                'id', 'id_sisr', 'id_efe_ser_esp',
                'fecha', 'hora', 'dias_antes', 'plantilla_reco'
            )
        )

        turnos = list(turnos_qs)
        if not turnos:
            print("No hay turnos candidatos para recordatorios.")
            return

        # Filtrar los que realmente correspondan: fecha - dias_antes == hoy
        candidatos = []
        for t in turnos:
            fecha: date = t['fecha']
            dias_antes = int(t['dias_antes'] or 0)

            if fecha - timedelta(days=dias_antes) == hoy:
                candidatos.append(t)

        if not candidatos:
            print("Ningún turno requiere recordatorio hoy.")
            return

        turnos_ids = [t['id_sisr'] for t in candidatos]
        turnos_map = {t["id_sisr"]: t for t in candidatos}

        conn = connections['informix']
        resultados = []

        if turnos_ids:
            with conn.cursor() as cur:
                cur.execute(query_detalles_turno(len(turnos_ids)), turnos_ids)
                resultados = cur.fetchall()

        if not resultados:
            print("No se obtuvieron resultados desde Informix para los turnos solicitados.")
            return

        per_day_counter = defaultdict(int)
        per_day_batches = {}

        for r in resultados:
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
                print(f"[WARN] Tuple de resultados con longitud inesperada: {ex} -> {r}")
                continue

            t_local = turnos_map.get(id_turno)
            if not t_local:
                print(f"[WARN] No se encontró turno local para id_turno={id_turno}")
                continue

            # Definir variables del turno al inicio, antes de cualquier guardia
            id_local = t_local["id"]
            fecha_turno = t_local["fecha"]
            dias_antes = int(t_local.get("dias_antes") or 0)
            id_efe_ser_esp_local = t_local["id_efe_ser_esp"]

            telefono = normalizar_telefono(carac_tel, tel)
            if not telefono:
                print(f"[DEBUG] Teléfono inválido para turno {id_turno}")

                turno_db = Turno.objects.filter(id=id_local).first()
                if turno_db:
                    # Obtener la plantilla asociada al tipo recordatorio (tipo=4)
                    _, plantilla = check_turno(id_efe_ser_esp_local, 4)

                    create_Mensaje(
                        id=None,
                        turno=turno_db,
                        numero=None,
                        plantilla=plantilla,  # puede ser None si no se encuentra
                        estado=-3,
                        fecha=timezone.now(),
                        sesion=None,
                    )

                continue

            # fecha objetivo para el envío (la que determinó el candidato)
            target_date = fecha_turno - timedelta(days=dias_antes)

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
                    offsets = sorted(
                        random.randint(0, BATCH_WINDOW_SECONDS - 1)
                        for _ in range(BATCH_SIZE)
                    )
                per_day_batches[batch_key] = offsets

            offset = per_day_batches[batch_key][pos_in_batch]

            send_dt = send_dt + timedelta(
                seconds=(batch_index * BATCH_WINDOW_SECONDS + offset)
            )

            per_day_counter[target_date] += 1

            if timezone.is_naive(send_dt):
                send_dt = make_aware(send_dt, TZ)

            send_dt = ajustar_horario_envio(send_dt)

            if timezone.is_naive(send_dt):
                send_dt = make_aware(send_dt, TZ)

            now = datetime.now(TZ)

            eta = send_dt if send_dt > now else now + timedelta(seconds=5)

            try:
                args = list(map(str, r))
                args.append(str(id_local))

                send_reminder_task.apply_async(args=args, eta=eta)

                print(f"Programado turno {id_turno} en {eta.isoformat()}")

            except Exception as ex:
                print(f"[ERROR] al programar send_reminder_task para id_turno={id_turno}: {ex}")

        print("Procesamiento de recordatorios completado")

    except Exception as e:
        print(f"Error en recordatorios: {e}")



@shared_task(bind=True, max_retries=100)
def send_reminder_task(
    self,
    id_turno,
    id_efector, id_servicio, id_especialidad,
    id_efe_ser_esp, tipo_doc, nro_doc,
    ape_pac, nom_pac, fecha_turno, hora_turno,
    ape_prof, nom_prof, nombre_servicio, nombre_especialidad,
    nombre_efector, calle, altura, letra, coordx, coordy,
    tel_efe, calle_nom, carac_tel, tel, id
):
    # seguridad: inicializar ack
    ack = None

    need_retry = False  # bandera para reintentar después del commit

    try:

        with transaction.atomic():
            turno = Turno.objects.select_for_update().get(id=id)

            if turno.id_estado_id != 3 or turno.msj_recordatorio == 1:
                return

            # comprobar si aún corresponde (ej: chequeos de configuración dinámica)
            send_flag, plantilla = check_turno(id_efe_ser_esp, 4)
            if not send_flag or not plantilla:
                print(f"[DEBUG] check_turno returned send={send_flag}, plantilla={plantilla} for turno {id_turno}")
                return

            if Mensaje.objects.filter(id_turno=id, id_plantilla__id_tipo__id=4).exists():
                print(f"[DEBUG] ya se intento enviar el mensaje, abortando")
                return

            telefono = normalizar_telefono(carac_tel, tel)
            if not telefono:
                return

            d_fecha = parse_date(fecha_turno)
            d_hora = parse_time(hora_turno)
            turno_dt = make_aware(datetime.combine(d_fecha, d_hora), TZ)

            now = datetime.now(TZ)

            if now >= turno_dt:
                print(f"[INFO] Turno vencido {id_turno}")
                return


            url = token_url(turno.id)
            # 📩 armar mensaje
            datos_plantilla = {
                "nompac": nom_pac or "",
                "apepac": ape_pac or "",
                "fecha": d_fecha.strftime("%d-%m-%Y"),
                "horaturno": d_hora.strftime("%H:%M"),
                "nomprof": nom_prof or "",
                "apeprof": ape_prof or "",
                "especialidad": nombre_especialidad or "",
                "efector": nombre_efector or "",
                "servicio": nombre_servicio or "",
                "calle": calle or "",
                "altura": altura or "",
                "letra": letra or "",
                "coordx": coordx or "",
                "coordy": coordy or "",
                "tel_efe": tel_efe or "",
                "calle_nom": calle_nom or "",
                "url": url
            }

            mensaje = format_plantilla(plantilla.contenido, datos_plantilla)

            res = enviar_whatsapp(telefono, mensaje)
            (envio_id, ack, fecha, ins) = decode_res(res)
            
            if ack != -5:
                create_Mensaje(
                    id=envio_id,
                    turno=turno,
                    numero=telefono,
                    plantilla=plantilla,
                    estado=ack,
                    fecha=fecha,
                    sesion=ins
                )
            
            if ack >= 0:
                turno.msj_recordatorio = 1
                turno.save(update_fields=["msj_recordatorio" ]) 

                # CIRUGIA GENERAL
                if int(id_efector) == 1 and int(id_servicio) == 85 and int(id_especialidad) == 112:
                    nown = datetime.now()
                    turno.id_estado_paciente_id = 4
                    turno.fecha_estado_paciente = nown
                    turno.save(update_fields=["id_estado_paciente", "fecha_estado_paciente"])
                return

            if ack == -5:
                eta = calcular_proximo_retry(now)
                if eta < turno_dt:
                    print(f"[RETRY] turno {id_turno} en {eta}")
                    raise self.retry(eta=eta)
                create_Mensaje(
                    id=envio_id,
                    turno=turno,
                    numero=telefono,
                    plantilla=plantilla,
                    estado=ack,
                    fecha=fecha,
                    sesion=ins
                )
                print(f"[STOP] se alcanzó la fecha/hora del turno {id_turno}")
                return

            return

    except self.MaxRetriesExceededError:
        print(f"[WARN] Max retries alcanzado {id_turno}")

    except Exception as e:
        print(f"[ERROR general en send_reminder_task para id_turno={id_turno}]: {e}")