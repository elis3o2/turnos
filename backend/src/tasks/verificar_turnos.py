from django.utils import timezone
from django.db import connections
from django.core.cache import cache
from celery import shared_task
import datetime
from src.apps.turno.models import LastMod
from src.apps.efector.models import EfeSerEsp
from .utils import (enviar_whatsapp, decode_res, format_message_meta, send_message_meta, decode_res_meta,
                    format_message_twilio, send_message_twilio, decode_res_twilio)
from src.apps.turno.services import create_Turno, update_estado_Turno
from src.apps.mensaje.services import create_Mensaje, check_turno, format_plantilla
from src.utils.querys_informix import query_detalles_turno, query_efector, query_persona, query_turnos_historico
from src.utils.parse import parse_date, parse_time
from src.apps.turno_espera.services import sacar_Turno_Espera
from src.utils.parse import normalizar_telefono

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _get_detalles(cur, idturno):
    """Trae los detalles completos del turno desde Informix. Retorna la fila o None."""
    try:
        cur.execute(query_detalles_turno(1), [idturno])
        return cur.fetchone()
    except Exception as ex:
        print(f"[ERROR] query_detalles_turno idturno={idturno}: {ex}")
        return None


def _get_persona(cur, idpaciente):
    """Trae datos de la persona desde Informix. Retorna (ape, nom, carac_tel, tel) o Nones."""
    try:
        cur.execute(query_persona(), [idpaciente])
        row = cur.fetchone()
        if row:
            return row  # (ape_pac, nom_pac, carac_tel, tel)
    except Exception as ex:
        print(f"[ERROR] query_persona idpaciente={idpaciente}: {ex}")
    return None, None, None, None


def _get_efector(cur, id_efector):
    """Trae datos del efector desde Informix. Retorna la fila o Nones."""
    try:
        cur.execute(query_efector(), [id_efector])
        row = cur.fetchone()
        if row:
            return row  # (nombre_efector, calle, altura, letra, coordx, coordy, tel_efe, calle_nom)
    except Exception as ex:
        print(f"[ERROR] query_efector id_efector={id_efector}: {ex}")
    return None, None, None, None, None, None, None, None


def _enriquecer_con_ese(t, id_efe_ser_esp):
    """
    A partir de un objeto Turno (o id_efe_ser_esp), trae los datos relacionados
    desde Django ORM (EfeSerEsp). Retorna un dict con los campos o lanza excepción.
    """
    if id_efe_ser_esp is None:
        id_efe_ser_esp = getattr(t, "efe_ser_esp_id", None)

    ese_obj = (
        EfeSerEsp.objects
        .select_related(
            "efector",
            "ser_esp__servicio",
            "ser_esp__especialidad",
        )
        .get(pk=id_efe_ser_esp)
    )

    return {
        "id_efe_ser_esp":    id_efe_ser_esp,
        "id_efector":        ese_obj.efector.id,
        "id_servicio":       ese_obj.ser_esp.servicio.id,
        "id_especialidad":   ese_obj.ser_esp.especialidad.id,
        "nombre_efector":    ese_obj.efector.nombre,
        "nombre_servicio":   ese_obj.ser_esp.servicio.nombre,
        "nombre_especialidad": ese_obj.ser_esp.especialidad.nombre,
    }


def _enviar_mensaje(t, idturno, estado, datos):
    """
    Decide si hay que enviar WhatsApp, lo envía y persiste el Mensaje.
    Retorna True si todo OK, False si hubo error (no lanza excepción).
    """
    id_efe_ser_esp = datos.get("id_efe_ser_esp")
    send, plantilla = check_turno(id_efe_ser_esp, estado)
    if not (send and plantilla):
        return True

    carac_tel = datos.get("carac_tel")
    tel       = datos.get("tel")
    telefono  = normalizar_telefono(carac_tel, tel)
    ack       = -3
    telefono = None
    if telefono:

        datos_plantilla = {
            "nombre_pac":    datos.get("nom_pac", ""),
            "apellido_pac":  datos.get("ape_pac", ""),
            "fecha":         datos.get("fecha", ""),
            "horaturno":     datos.get("hora", ""),
            "nombre_prof":   datos.get("nom_prof", ""),
            "apellido_prof": datos.get("ape_prof", ""),
            "especialidad":  datos.get("nombre_especialidad", ""),
            "efector":       datos.get("nombre_efector", ""),
            "servicio":      datos.get("nombre_servicio", ""),
            "calle":         datos.get("calle", ""),
            "altura":        datos.get("altura", ""),
            "letra":         datos.get("letra", ""),
            "coordx":        datos.get("coordx", ""),
            "coordy":        datos.get("coordy", ""),
            "tel_efe":       datos.get("tel_efe", ""),
            "calle_nom":     datos.get("calle_nom", ""),
        }

        parameters = format_message_twilio(plantilla, datos_plantilla)
        res        = send_message_twilio(telefono, plantilla.content_sid, parameters)
        try:
            (envio_id, ack, fecha_msj, ins) = decode_res_twilio(res)
            create_Mensaje(
                id=envio_id, turno=t, numero=telefono,
                plantilla=plantilla, estado=ack, fecha=fecha_msj, sesion=ins,
            )
        except Exception as ex:
            print(f"[ERROR] create_Mensaje turno={idturno}: {ex}")
            return False
    else:
        try:
            telefono = ("549" + str(carac_tel) + str(tel)).replace(" ", "")
            create_Mensaje(turno=t, plantilla=plantilla, numero=telefono, estado=ack)
        except Exception as ex:
            print(f"[ERROR] create_Mensaje (sin tel) turno={idturno}: {ex}")

    # Actualizar flags msj_* en Turno
    if ack >= 0:
        try:
            flag_map = {1: "msj_asignado", 2: "msj_cancelado", 3: "msj_reprogramado"}
            campo = flag_map.get(estado)
            if campo:
                setattr(t, campo, 1)
                t.save(update_fields=[campo])
        except Exception as ex:
            print(f"[ERROR] actualizar flag msj_* turno={idturno}: {ex}")

    return True


def _procesar_fila(cur, idturno, idpaciente, estado):
    """
    Procesa una única fila de Informix.
    Lanza excepción si algo crítico falla (así el caller no avanza LastMod).
    """
    datos = {}  # acumula todo lo necesario para enviar el mensaje

    # ------------------------------------------------------------------
    # Estado 3 u 8: necesitamos detalles completos del turno
    # ------------------------------------------------------------------
    if estado in (3, 8):
        detalles = _get_detalles(cur, idturno)
        if not detalles:
            raise ValueError(f"Sin detalles para idturno={idturno}")

        (
            _id, id_efector, id_servicio, id_especialidad, id_efe_ser_esp,
            tipo_doc, nro_doc, ape_pac, nom_pac, fecha_turno, hora_turno,
            ape_prof, nom_prof, nombre_servicio, nombre_especialidad,
            nombre_efector, calle, altura, letra, coordx, coordy,
            tel_efe, calle_nom, carac_tel, tel
        ) = detalles

        d_fecha = parse_date(fecha_turno)
        d_hora  = parse_time(hora_turno)

        datos.update({
            "id_efe_ser_esp": id_efe_ser_esp,
            "id_efector": id_efector, "id_servicio": id_servicio,
            "id_especialidad": id_especialidad,
            "ape_pac": ape_pac, "nom_pac": nom_pac,
            "ape_prof": ape_prof, "nom_prof": nom_prof,
            "nombre_servicio": nombre_servicio,
            "nombre_especialidad": nombre_especialidad,
            "nombre_efector": nombre_efector,
            "calle": calle, "altura": altura, "letra": letra,
            "coordx": coordx, "coordy": coordy,
            "tel_efe": tel_efe, "calle_nom": calle_nom,
            "carac_tel": carac_tel, "tel": tel,
            "fecha": d_fecha.strftime("%d-%m-%Y"),
            "hora":  d_hora.strftime("%H:%M"),
        })

        if estado == 3:
            t = create_Turno(idturno, idpaciente, estado, id_efe_ser_esp, d_fecha, d_hora)
            print(f"[INFO] Turno id={idturno} creado/existente")
            b = sacar_Turno_Espera(idpaciente, id_efe_ser_esp, idturno)
            if b:
                print(f"[INFO] Turno espera asignado idpaciente={idpaciente}")

    # ------------------------------------------------------------------
    # Cualquier otro estado: actualizar
    # ------------------------------------------------------------------
    if estado != 3:
        t = update_estado_Turno(idturno, idpaciente, estado)
        if t is None:
            print(f"[DEBUG] update_estado_Turno retornó None para idturno={idturno}, se omite")
            return

        # Estados que requieren datos extra para el mensaje
        if estado in (1, 2, 7):
            ape_pac, nom_pac, carac_tel, tel = _get_persona(cur, idpaciente)

            ese_datos = _enriquecer_con_ese(t, datos.get("id_efe_ser_esp"))

            nombre_efector, calle, altura, letra, coordx, coordy, tel_efe, calle_nom = \
                _get_efector(cur, ese_datos["id_efector"])

            d_fecha = getattr(t, "fecha", None)
            d_hora  = getattr(t, "hora", None)

            datos.update(ese_datos)
            datos.update({
                "ape_pac": ape_pac, "nom_pac": nom_pac,
                "carac_tel": carac_tel, "tel": tel,
                "nombre_efector": nombre_efector,
                "calle": calle, "altura": altura, "letra": letra,
                "coordx": coordx, "coordy": coordy,
                "tel_efe": tel_efe, "calle_nom": calle_nom,
                "nom_prof": None, "ape_prof": None,
                "fecha": parse_date(d_fecha).strftime("%d-%m-%Y"),
                "hora":  parse_time(d_hora).strftime("%H:%M"),
            })

        # Estados sin mensaje
        if estado in (4, 5, 6):
            return

    # ------------------------------------------------------------------
    # Enviar mensaje
    # ------------------------------------------------------------------
    _enviar_mensaje(t, idturno, estado, datos)


# ---------------------------------------------------------------------------
# Task principal
# ---------------------------------------------------------------------------

@shared_task
def verificar_turnos() -> None:
    lock_id = 'lock-verificar-turnos'
    acquired = cache.add(lock_id, '1', 55)  # TTL un poco menor que el intervalo de 60s
    if not acquired:
        print("[INFO] verificar_turnos ya está corriendo, se omite esta ejecución.")
        return

    try:
        print(f"[{timezone.now()}] Ejecutando verificación de turnos...")

        last_mod_obj = LastMod.objects.first()
        if not last_mod_obj:
            print("[ERROR] No existe LastMod en la base.")
            return

        conn = connections['informix']
        with conn.cursor() as cur:
            lm_param = last_mod_obj.fecha.strftime("%Y-%m-%d %H:%M:%S")
            print(f"[DEBUG] Usando last_mod: {lm_param!r}")

            try:
                cur.execute(query_turnos_historico(), [lm_param])
            except Exception as ex:
                print(f"[ERROR] query_turnos_historico con param {lm_param!r}: {ex}")
                return

            rows = list(cur.fetchall())
            rows.sort(key=lambda r: (r[3], r[0]))  # ASC por timestamp, luego por idturno

            for r in rows:
                idturno, idpaciente, idestadoturno, last_modf_val = r

                if isinstance(last_modf_val, datetime.datetime):
                    este_dt = last_modf_val.replace(microsecond=0)
                    if timezone.is_aware(este_dt):
                        este_dt = timezone.make_naive(este_dt)  # quitar tz si tiene
                else:
                    # Si viene como string
                    este_raw = str(last_modf_val).split(".")[0]
                    este_dt = datetime.datetime.strptime(este_raw, "%Y-%m-%d %H:%M:%S")

                print(f"[DEBUG] Procesando idturno={idturno} estado={idestadoturno} last_mod={este_dt}")

                try:
                    _procesar_fila(cur, idturno, idpaciente, idestadoturno)
                except Exception as ex:
                    print(f"[ERROR] _procesar_fila idturno={idturno}: {ex}")
                    # No avanzamos LastMod → esta fila se reintentará en la próxima ejecución
                    continue

                # Avanzar LastMod solo si la fila se procesó sin errores
                last_mod_obj.fecha = este_dt
                last_mod_obj.save(update_fields=['fecha'])
                print(f"[DEBUG] LastMod actualizado a {este_dt}")

    finally:
        cache.delete(lock_id)