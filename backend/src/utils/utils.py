import requests
import emoji
from decouple import config
from src.models import EfeSerEspPlantilla, Mensaje, Flow, TurnoFlow, Turno, Plantilla, TurnoEspera, PlantillaFlow
import re
import logging
logger = logging.getLogger(__name__)
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.utils.timezone import now
from django.db import connections, DatabaseError
from datetime import timedelta, datetime, date, time
from .querys_informix import query_profesional_from_id,query_profesional_from_nombre, query_paciente, query_turno_fecha
from zoneinfo import ZoneInfo
from django.core import signing


TZ = ZoneInfo("America/Argentina/Buenos_Aires")

def update_msg_state(mensaje: Mensaje) -> Mensaje:
    """
    Consulta la API externa por el estado del mensaje y actualiza Mensaje(pk=mensaje_id).
    Devuelve el Mensaje actualizado o el original si hay error.
    """
    api_url = f'{config("API_ESTADO_WHATSAPP")}/{mensaje.id_sesion_id}/{mensaje.id_mensaje}/{mensaje.numero}'

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
            mensaje.id_estado_id = data["ack"]

        mensaje.save(update_fields=["fecha_last_ack", "id_estado"])
        return mensaje

    except Exception:
        return mensaje


def enviar_whatsapp(numero: str, mensaje: str) -> Response:

    ms = (
        Mensaje.objects
        .filter(numero=numero)
        .exclude(id_sesion_id__isnull=True)
        .order_by("-fecha_envio")
        .values_list("id_sesion_id", flat=True)
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
        .exclude(id_sesion_id__isnull=True)
        .order_by("-fecha_envio")
        .values_list("id_sesion_id", flat=True)
        .first()
    )

    return _enviar_whatsapp2(numero, mensaje, sesion)


def _enviar_whatsapp2(numero: str, mensaje: str, sesion: str | None) -> Response:
    api_url = config('API_WHATSAPP')

    session_req = requests.Session()
    session_req.trust_env = False  # 🔥 clave

    payload = {
        "numero": numero,
        "texto": mensaje,
    }

    if sesion:
        payload["session"] = sesion

    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

    try:
        response = session_req.post(   # 👈 usar la session
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
    print(response_data)
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


def map_estdo_plantila (id: int) -> int :
    if id in (1, 2, 7):
        return 2
    if id == 3:
        return 1
    if id == 8:
        return 3
    else:
        return 4


    
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
            3: ("asignacion", "plantilla_asig"),
            1: ("cancelacion", "plantilla_canc"),
            2: ("cancelacion", "plantilla_canc"),
            7: ("cancelacion", "plantilla_canc"),
            8: ("reprogramacion", "plantilla_repr")
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


def fetch_paciente(id_persona=None, dni=None):
    """
    Retorna lista de dicts con pacientes (posiblemente vacía).
    """
    if not id_persona and not dni:
        return []
    id: bool
    if id_persona:
        id = True
        params = (id_persona,)
    else:
        id = False
        params = (dni,)


    try:
        with connections['informix'].cursor() as cur:
            cur.execute(query_paciente(id), params)
            rows = cur.fetchall()
            if not rows:
                return []

            desc = cur.description or []
            cols = [str(c[0]).lower() for c in desc]
            result = []
            for r in rows:
                result.append({ cols[i]: r[i] for i in range(len(r)) })
            return result

    except DatabaseError:
        logger.exception("Error consultando Informix (paciente list)")
        raise


def fetch_profesional(id_prof=None, id_efector=None, nombre=None, apellido=None):
    """
    Retorna lista de dicts con profesionales que coincidan (posiblemente vacía).
    Si id_prof está provisto busca por idpersonal; si no, usa id_efector + filtros.
    """
    params = []
    if id_prof:
        sql = query_profesional_from_id()
        params = [id_prof]
    else:
        if not id_efector:
            return []
        sql = query_profesional_from_nombre(id_efector, nombre, apellido)
        params = [id_efector]
        if nombre:
            params.append(nombre.strip().upper() + '%')
        if apellido:
            params.append(apellido.strip().upper() + '%')

    try:
        with connections['informix'].cursor() as cur:
            cur.execute(sql, tuple(params))
            rows = cur.fetchall()
            if not rows:
                return []

            desc = cur.description or []
            cols = [str(c[0]).lower() for c in desc]
            result = []
            for r in rows:
                result.append({ cols[i]: r[i] for i in range(len(r)) })
            return result

    except DatabaseError:
        logger.exception("Error consultando Informix (profesional list)")
        raise


def start_flow(numero: str, flowName: str, id_ses: int) -> Response:
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
            "endpoint": endpoint,
            "session": id_ses
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
        if t.id_estado_id != id_est:
            t.id_estado_id = id_est
            t.save(update_fields=["id_estado_id"])

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
            id_estado_id=id_est,
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
        id_turno=turno,
        numero=numero,
        id_plantilla=plantilla,
        fecha_envio=fecha,
        id_estado_id=estado,
        id_sesion_id=sesion
    )



def sacar_Turno_Espera(id_pac: int, id_efe_ser_esp: int, id_turno: int) -> bool:
    turno = (
        TurnoEspera.objects
        .filter(
            id_paciente=id_pac,
            id_efe_ser_esp=id_efe_ser_esp,
            id_estado_id=0
        )
        .order_by('fecha_hora_creacion')
        .first()
    )

    if not turno:
        return False

    turno.id_estado_id = 1  # o el estado que corresponda
    turno.id_turno_asignado = id_turno
    turno.save(update_fields=["id_estado_id", "id_turno_asignado"])

    return True



    
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


def create_flow(telefono: str, turno: Turno, id_ses: int ) -> None:
    try:
        res = start_flow(telefono, "asignacion-turno")
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
                    "id_plantilla_flow": plantilla_flow,
                    "numero": telefono,
                    "id_sesion_id": sesion,
                    "id_estado_id": 0,
                    "fecha_inicio": timezone.now()
                },
            )
            # si ya existía y querés forzar estado a 0:
            if not created and f.id_estado_id != 0:
                f.id_estado_id = 0
                f.save(update_fields=["id_estado_id"])

            # crear TurnoFlow idempotente
            TurnoFlow.objects.get_or_create(id_turno=turno, id_flow=f)

            # actualizar estado paciente
            turno.id_estado_paciente_id = 4
            turno.save(update_fields=["id_estado_paciente"])
    else:
        ack = decode_res(res)
        if ack < 0:
            turno.id_estado_paciente_id = ack
            turno.save(update_fields=["id_estado_paciente"])




def token_url(id: int) -> str :
    token =signing.dumps(id)
    url = f'{config("DOMAIN")}/confirma/?id={token}'
    return url


HORA_INICIO = time(8, 16)
HORA_FIN = time(20, 0)
def ajustar_horario_envio(dt):
    if timezone.is_naive(dt):
        dt = make_aware(dt, TZ)          

    dt_local = dt.astimezone(TZ)
    t = dt_local.time()

    if t < HORA_INICIO:
        naive = datetime.combine(dt_local.date(), time(HORA_INICIO.hour, 0, 0))
        return make_aware(naive, TZ)
    elif t > HORA_FIN:
        next_day = (dt_local + timedelta(days=1)).date()
        naive = datetime.combine(next_day, time(HORA_INICIO.hour, 0, 0))
        return make_aware(naive, TZ)

    return dt_local


def calcular_proximo_retry(now):
    eta = now + timedelta(minutes=15)
    return ajustar_horario_envio(eta)




def lista_espera_look(turno: Turno):
    with connections['informix'].cursor() as cur:
        cur.execute(query_turno_fecha(), (turno.id_sisr,))
        row = cur.fetchone()

    if not row:
        return  # no hay fecha

    fecha_str = row[0]

    # convertir string → datetime
    fecha = datetime.strptime(fecha_str, "%Y-%m-%d %H:%M:%S")

    inicio_dia = fecha.replace(hour=0, minute=0, second=0, microsecond=0)
    fin_dia = inicio_dia + timedelta(days=1)

    a = TurnoEspera.objects.filter(
        fecha_hora_cierre__gte=inicio_dia,
        fecha_hora_cierre__lt=fin_dia,
        id_paciente=turno.id_paciente,
        id_efe_ser_esp=turno.id_efe_ser_esp,
        id_estado=1
    ).update(
        id_estado=0,
        fecha_hora_cierre=None
    )




def liberar_turno(id: int) -> bool:
    api_url = config('URL_LIBERAR_TURNO')

    session_req = requests.Session()
    session_req.trust_env = False  

    payload = {
        "idturno": id,
        "clave": config('CLAVE_LIBERAR_TURNO'),
    }

    headers = {
        "Content-Type": "application/json",
        "Accept": "application/json",
    }

    try:
        response = session_req.post(
            api_url,
            json=payload,
            headers=headers,
            timeout=15
        )

        # Si la API responde (aunque sea error HTTP)
        if response.status_code == 200:
            data = response.json()
            return data.get("success", False)

        # Si devuelve 403, 500, etc → lo tomamos como False
        return False

    except requests.RequestException:
        # Error de red, timeout, conexión, etc
        return False