import requests
import emoji
from decouple import config
from src.apps.mensaje.models import EfeSerEspPlantilla, Mensaje, Flow, TurnoFlow,Plantilla, PlantillaFlow 
from src.apps.turno.models import Turno
from src.apps.turno_espera.models import TurnoEspera
import re
import logging
logger = logging.getLogger(__name__)
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.utils.timezone import now
from django.db import connections, DatabaseError
from datetime import timedelta, datetime, date, time
from .querys_informix import query_profesional_from_id,query_profesional_from_nombre, query_paciente_from_dni, query_paciente_from_id
from zoneinfo import ZoneInfo
from typing import Any


Row = dict[str, Any]
TZ = ZoneInfo("America/Argentina/Buenos_Aires")


def update_msg_state(mensaje: Mensaje) -> Mensaje:
    """
    Consulta la API externa por el estado del mensaje y actualiza Mensaje(pk=mensaje_id).
    Devuelve el Mensaje actualizado o el original si hay error.
    """
    api_url = f'{config("API_ESTADO_WHATSAPP")}/{mensaje.sesion_id}/{mensaje.id_mensaje}/{mensaje.numero}'

    session = requests.Session()
    session.trust_env = False 

    try:
        resp = session.get(
            api_url,
            headers={
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            timeout=5
        )

        content_type = resp.headers.get("Content-Type", "")

        if "application/json" not in content_type:
            return mensaje

        data = resp.json()

    except requests.exceptions.RequestException:
        return mensaje
    except ValueError:
        return mensaje

    # Actualizar Mensaje local si existe
    try:
        mensaje.fecha_last_ack = now()
        if isinstance(data, dict) and "ack" in data:
            mensaje.estado_id = data["ack"]

        mensaje.save(update_fields=["fecha_last_ack", "id_estado"])
        return mensaje

    except Exception:
        return mensaje


def enviar_whatsapp(numero: str, mensaje: str) -> Response:

    ms = (
        Mensaje.objects
        .filter(numero=numero)
        .exclude(sesion_id__isnull=True)
        .order_by("-fecha_envio")
        .values_list("sesion_id", flat=True)
        .distinct()
    )

    list_sessions = list(ms)

    return _enviar_whatsapp(numero, mensaje, list_sessions)



def _enviar_whatsapp(numero: str, mensaje: str, sesions: list[str]) -> Response:
    """
    Envía el mensaje al número usando distintas sesiones.
    Si todas fallan, reintenta sin idInstancia.
    """

    api_url = config('API_WHATSAPP')
    token = config('TOKEN_WHATSAPP')

    json_base = {
        "destinatario": numero,
        "texto": mensaje,
        "linkPreview": False,
        "modo": "SYNC"
    }

    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "Authorization": f"Bearer {token}"
    }

    # 1️⃣ Intentar con cada sesión
    for sesion_id in sesions:
        json_data = json_base.copy()
        json_data["idInstancia"] = sesion_id

        try:
            response = requests.post(
                api_url,
                json=json_data,
                headers=headers,
                timeout=15
            )

            if 200 <= response.status_code < 300:
                if "application/json" in response.headers.get("Content-Type", ""):
                    return Response(response.json(), status=response.status_code)

                return Response(
                    {"detail": "Mensaje enviado pero respuesta no JSON"},
                    status=response.status_code
                )

        except requests.exceptions.RequestException:
            continue  # probar siguiente sesión

    # 2️⃣ Si todas fallaron → intentar sin idInstancia
    try:
        response = requests.post(
            api_url,
            json=json_base,
            headers=headers,
            timeout=15
        )

        if 200 <= response.status_code < 300:
            if "application/json" in response.headers.get("Content-Type", ""):
                return Response(response.json(), status=response.status_code)

            return Response(
                {"detail": "Mensaje enviado sin idInstancia pero respuesta no JSON"},
                status=response.status_code
            )

        return Response(
            {
                "error": "Falló con sesiones y también sin idInstancia",
                "status_code": response.status_code,
                "raw_response": response.text[:500]
            },
            status=status.HTTP_502_BAD_GATEWAY
        )

    except requests.exceptions.RequestException as e:
        return Response(
            {"error": "No se pudo conectar con la API WhatsApp", "detail": str(e)},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )

def decode_res(res: dict) -> (str, int, datetime, str):
    response_data = getattr(res, "data", {}) 
    envio = response_data.get("envio", {})
    envio_id = None
    ins = None
    ack = None
    if envio:
        envio_id = envio.get("id")
        est = envio.get("estado")
        ts = envio.get("timestamp")

        fecha = datetime.fromtimestamp(ts, TZ).replace(tzinfo=None)
        if est == "COMPLETADO":
            ins = get_session(envio_id)
            ins = str(ins) if ins is not None else ins
            ack = 1
        else:
            ack = -1
    else:
        fecha = timezone.now()
        ack = -5
    
    return (envio_id, ack, fecha, ins)

def enviar_whatsapp2(numero: str, mensaje: str) -> Response:

    sesion = (
        Mensaje.objects
        .filter(numero=numero)
        .exclude(sesion_id__isnull=True)
        .order_by("-fecha_envio")
        .values_list("sesion_id", flat=True)
        .first()
    )

    return _enviar_whatsapp2(numero, mensaje, sesion)



def _enviar_whatsapp2(numero: str, mensaje: str, sesion: str | None) -> Response:
    """
    Envía el mensaje al número usando la sesión indicada.
    """

    api_url = config('API_WHATSAPP')

    payload = {
        "numero": numero,
        "texto": mensaje,
    }

    if sesion:
        payload["session"] = sesion

    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json"
    }

    try:
        response = requests.post(
            api_url,
            json=payload,
            headers=headers,
            timeout=15
        )

        if "application/json" in response.headers.get("Content-Type", ""):
            return Response(response.json(), status=response.status_code)

        return Response(
            {"detail": "Mensaje enviado pero respuesta no JSON"},
            status=response.status_code
        )

    except requests.exceptions.RequestException as e:
        return Response(
            {
                "error": "No se pudo conectar con la API WhatsApp",
                "detail": str(e)
            },
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )



def decode_res2(res: dict) -> (str, int, datetime, str):
    response_data = getattr(res, "data", {}) 
    code = response_data.get("code", {})
    envio_id = None
    ins = None
    ack = None
    if code == 0:
        envio_id = response_data.get("id")
        ack = response_data.get("ack")
        fecha = response_data.get("time")
        ins = response_data.get("session")
    else:
        fecha = timezone.now()
        if code == -1:
            ack = -4
        elif code == -2:
            ack = -3
        elif code == -3:
            ack = -2
        else:
            ack = -5
    
    return (envio_id, ack, fecha, ins)

    
def check_turno(efe_ser_esp: int, estado: int) -> (bool, Plantilla | None):
    """
    Revisa si el efe_ser_esp tiene la bandera del estado encendida y si es asi
    devuelve la Plantilla asociada
    """
    try:
        turno = EfeSerEspPlantilla.objects.filter(
            id_efe_ser_esp=efe_ser_esp,
        ).first()
        
        if not turno:
            return False, None
        
        # Mapear estado → tipo y campo de plantilla
        mapping = {
            1: ("confirmacion", "plantilla_asig"),
            2: ("cancelacion", "plantilla_canc"),
            3: ("reprogramacion", "plantilla_repr"),
        }
        
        tipo, campo_plantilla = mapping.get(estado, ("recordatorio", "plantilla_reco"))
        
        # Chequear si el flag booleano del tipo está activo
        if getattr(turno, tipo) == 1:  
            plantilla = getattr(turno, campo_plantilla)
            if plantilla:
                plantilla.contenido = emoji.emojize(plantilla.contenido)
            return True, plantilla

        
        return False, None
    
    except Exception as e:
        print(f"Error en check_turno: {e}")
        return False, None



def format_plantilla(contenido: str, valores) -> str:
    """
    Reemplaza placeholders en la plantilla con valores reales
    Ejemplo: {nompac} -> Juan
    """
    def replace_match(match):
        key = match.group(1)  # Obtiene el nombre entre llaves
        return str(valores.get(key, match.group(0)))  # Reemplaza o deja original si no existe
    
    # Usa expresión regular para encontrar {placeholder}
    return re.sub(r'{(\w+)}', replace_match, contenido)


# ─── helpers ──────────────────────────────────────────────────────────────────

def _rows_to_dicts(cur) -> list[Row]:
    rows = cur.fetchall()
    if not rows:
        return []
    cols = [str(c[0]).lower() for c in (cur.description or [])]
    return [{cols[i]: r[i] for i in range(len(r))} for r in rows]




# ─── fetch_paciente ───────────────────────────────────────────────────────────

def fetch_paciente(
    ids: list[int] | None = None,
    dni: str | None = None,
) -> list[Row]:
    if ids is not None:
        if not ids:
            return []
        query  = query_paciente_from_id(len(ids))
        params = tuple(ids)

    elif dni is not None:
        query  = query_paciente_from_dni()
        params = (dni,)

    else:
        return []

    try:
        with connections["informix"].cursor() as cur:
            cur.execute(query, params)
            return _rows_to_dicts(cur)
    except DatabaseError:
        logger.exception("Error consultando Informix (paciente)")
        raise




# ─── fetch_profesional ────────────────────────────────────────────────────────

def fetch_profesional(
    ids: list[int] | None = None,
    id_efector: int | None = None,
    nombre: str | None = None,
    apellido: str | None = None,
) -> list[Row]:
    if ids is not None:
        if not ids:
            return []
        query  = query_profesional_from_id(len(ids))
        params = tuple(ids)

    elif id_efector is not None:
        query        = query_profesional_from_nombre(id_efector, nombre, apellido)
        params_list  = [id_efector]
        if nombre:
            params_list.append(nombre.strip().upper() + "%")
        if apellido:
            params_list.append(apellido.strip().upper() + "%")
        params = tuple(params_list)

    else:
        return []

    try:
        with connections["informix"].cursor() as cur:
            cur.execute(query, params)
            return _rows_to_dicts(cur)
    except DatabaseError:
        logger.exception("Error consultando Informix (profesional)")
        raise



def start_flow(numero: str, flowName: str) -> Response:
    api_url = config('API_WHATSAPP_FLOW') 
    
    port = config('LISTEN_PORT')
    api = config('API_LISTEN')
    endpoint = f"http://localhost:{port}/{api}"

    session = requests.Session()
    session.trust_env = False  # ← clave

    try:
        response = session.post(
            api_url,
            json={
            "numero": numero,
            "flowName": flowName,
            "endpoint": endpoint
            },
            headers={
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            timeout=15
        )

        content_type = response.headers.get("Content-Type", "")

        if "application/json" in content_type:
            return Response(response.json(), status=response.status_code)

        return Response(
            {
                "error": "Respuesta no JSON desde la API WhatsApp",
                "status_code": response.status_code,
                "raw_response": response.text[:500]
            },
            status=status.HTTP_502_BAD_GATEWAY
        )

    except requests.exceptions.RequestException as e:
        return Response(
            {"error": "No se pudo conectar con la API WhatsApp", "detail": str(e)},
            status=status.HTTP_503_SERVICE_UNAVAILABLE
        )





def update_estado_Turno(id_sisr: int, id_pac: int, id_est: int) -> Turno | None: 
    try:
        # Obtener instancia
        t = Turno.objects.filter(id_sisr=id_sisr, id_paciente=id_pac).first()
        if t is None:
            print(f"[DEBUG] No existe Turno local con id={id_sisr} => se ignora notificación (estado={id_est})")
            return None

        # Asignar estado en la instancia y guardar (mínimo)
        if t.estado_id != id_est:
            t.estado_id = id_est
            t.save(update_fields=["estado_id"])

        print(f"[INFO] Actualizado Turno id={id_sisr} a estado={id_est}")
        return t
    
    except Exception as ex:
        print(f"[ERROR] al actualizar Turno id={id_sisr}: {ex}")
        return None


import requests
from decouple import config

def get_session(id: int) -> int | None:
    api_url = f"{config('API_ESTADO_WHATSAPP')}{id}"
    session = requests.Session()
    session.trust_env = True

    try:
        resp = session.get(
            api_url,
            headers={
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Authorization": "Bearer " + config("TOKEN_WHATSAPP"),
            },
            timeout=5,
        )


        # Verificar que sea JSON
        if "application/json" not in resp.headers.get("Content-Type", ""):
            return None

        data = resp.json()


        envio = data.get("envio")
        if not envio:
            return None

        ins = envio.get("idInstancia")

        # Asegurar que sea int
        return ins 

    except (requests.exceptions.RequestException, ValueError, TypeError) as e:
        return None




def create_Turno(id_sisr: int, id_pac: int, id_est: int, 
                 id_ess: int, fecha: date, hora: time) -> Turno:
    t = Turno.objects.create(
            id_sisr=id_sisr,
            id_paciente=id_pac,
            estado_id=id_est,
            id_estado_paciente_id=0,
            msj_asignado=0,
            msj_reprogramado=0,
            msj_cancelado=0,
            msj_recordatorio=0,
            id_efe_ser_esp_id=id_ess,
            fecha=fecha,
            hora=hora
        )
    return t


def create_Mensaje(
    id: str | None = None,
    turno: Turno | None = None,
    numero: str | None = None,
    plantilla: Plantilla | None = None,
    estado: int | None = None,
    fecha: datetime | None = None,
    sesion: str | None = None,
) -> None:
    if fecha == None:
        fecha = datetime.now()

    m = Mensaje.objects.create(
        id_mensaje=id,
        turno=turno,
        numero=numero,
        plantilla=plantilla,
        fecha_envio=fecha,
        estado_id=estado,
        sesion_id=sesion
    )



def sacar_Turno_Espera(id_pac: int, id_efe_ser_esp: int) -> bool:
    updated = TurnoEspera.objects.filter(
        id_paciente=id_pac,
        id_efe_ser_esp=id_efe_ser_esp,
        estado_id=0
    ).update(estado_id=1, fecha_hora_cierre=now())

    return updated > 0



    
def map_estdo(est: int) -> int:
    if est == 3:
        estado = 1
    elif est in (4, 5, 6):
        estado = 4
    elif est in (1, 2, 7):
        estado = 2
    elif est == 8:
        estado = 3
    return estado


#def decode_res(res: Response) -> int:
#    match res.status_code:
#        case 503:
#            ack = -5
#        case 400:
#            ack = -4
#        case 404:
#            ack = -3
#        case 422:
#            ack = -2
#        case 500:
#            ack = -1
#        case _:  
#            response_data = getattr(res, "data", {})
#            ack = int(response_data.get("ack", -5)) 
#
#    return ack
#


def create_flow(telefono: str, turno: Turno ) -> None:
    try:
        res = start_flow(telefono, "confirmacion-turno")
    except Exception as ex:
        print(f"[ERROR] start_flow falla para turno {id_turno}: {ex}")
        return

    status_code = getattr(res, "status_code", None)
    body = getattr(res, "data", {}) or {}
    if status_code == 200 and isinstance(body, dict):
        flow_pk = body.get("id")
        plantilla_flow = PlantillaFlow.objects.get(pk=1)
        sesion=body.get("session", None)
        if flow_pk:
            f, created = Flow.objects.get_or_create(
                pk=flow_pk,
                defaults={
                    "plantilla_flow_id": plantilla_flow,
                    "numero": telefono,
                    "sesion_id": sesion,
                    "estado_id": 0,
                    "fecha_inicio": timezone.now()
                },
            )
            # si ya existía y querés forzar estado a 0:
            if not created and f.estado_id != 0:
                f.estado_id = 0
                f.save(update_fields=["estado_id"])

            # crear TurnoFlow idempotente
            TurnoFlow.objects.get_or_create(turno=turno, flow=f)

            # actualizar estado paciente
            turno.id_estado_paciente_id = 4
            turno.save(update_fields=["id_estado_paciente"])
    else:
        ack = decode_res(res)
        if ack < 0:
            turno.id_estado_paciente_id = ack
            turno.save(update_fields=["id_estado_paciente"])



def to_value_label(serializer_data, value_field="id", label_field="nombre"):
    return [
        {
            "value": item[value_field],
            "label": item[label_field]
        }
        for item in serializer_data
    ]