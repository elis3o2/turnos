import requests
import json
from twilio.rest import Client
from rest_framework import status
from src.apps.mensaje.models import Mensaje
from core.settings import HORA_INICIO, HORA_FIN, TZ
from decouple import config
from django.utils import timezone
from django.core import signing
from rest_framework.response import Response
from datetime import datetime, timedelta
from typing import Any, Optional
from src.apps.mensaje.models import Plantilla, ContadorTwilio
from django.db import transaction
from datetime import date

def enviar_whatsapp(numero: str, mensaje: str) -> Response:

    sesion = (
        Mensaje.objects
        .filter(numero=numero)
        .exclude(sesion_id__isnull=True)
        .order_by("-fecha_envio")
        .values_list("sesion_id", flat=True)
        .first()
    )

    return _enviar_whatsapp(numero, mensaje, sesion)


def _enviar_whatsapp(numero: str, mensaje: str, sesion: str | None) -> Response:
    api_url = config('API_WHATSAPP')

    session_req = requests.Session()
    session_req.trust_env = False  
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


def decode_res(res: dict) -> (str, int, datetime, str):
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
    eta = now + timedelta(minutes=60)
    return ajustar_horario_envio(eta)


def token_url(id: int) -> str :
    token =signing.dumps(id)
    url = f'{config("DOMAIN")}/confirma/?id={token}'
    return url


def decode_res_meta(res: dict) -> tuple[Optional[str], int, datetime, str]:
    fecha = datetime.now()
    ins = "met"

    if "error" in res:
        return (None, -1, fecha, ins)

    try:
        envio_id = res["messages"][0]["id"]
        return (envio_id, 1, fecha, ins)

    except (KeyError, IndexError, TypeError):
        return (None, -1, fecha, ins)


def format_message_meta(plantilla: Plantilla, datos: Any) -> list[dict[str, Any]]:
    campos = [
        "pac_nombre",
        "pac_apellido",
        "fecha",
        "hora",
        "prof_nombre",
        "prof_apellido",
        "especialidad",
        "efector",
        "servicio",
        "calle",
        "altura",
        "letra",
        "coordx",
        "coordy",
        "tel_efe",
        "calle_nom",
        "url",
    ]

    parameters = []

    for campo in campos:
        if getattr(plantilla, campo, False):

            valor = datos.get(campo)

            parameters.append({
                "type": "text",
                "parameter_name": campo,
                "text": "" if valor is None else str(valor)
            })

    return [
        {
            "type": "body",
            "parameters": parameters
        }
    ]

def send_message_meta(numero: str, template: str, components: list):
    api_url = config('API_META')

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {config('KEY_META')}",
    }

    payload = {
        "messaging_product": "whatsapp",
        "to": numero,
        "type": "template",
        "template": {
            "name": template,
            "language": {
                "code": "es_AR"
            },
            "components": components
        }
    }

    session_req = requests.Session()

    try:
        response = session_req.post(
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


def decode_res_twilio(message) -> tuple[Optional[str], int, datetime, str]:
    """
    Decodifica la respuesta de Twilio.
    """

    fecha = datetime.now()
    ins = "twi"

    try:
        return (
            message.sid,
            1 if message.status not in ("failed", "undelivered") else -1,
            fecha,
            ins,
        )
    except Exception:
        return (None, -1, fecha, ins)



def format_message_twilio(plantilla: Plantilla, datos: Any) -> dict[str, str]:
    campos = [
        "nombre_pac",
        "apellido_pac",
        "fecha",
        "hora",
        "horaturno",
        "nombre_prof",
        "apellido_prof",
        "especialidad",
        "efector",
        "servicio",
        "calle",
        "altura",
        "letra",
        "coordx",
        "coordy",
        "tel_efe",
        "calle_nom",
        "url",
    ]

    variables = {}

    for campo in campos:
        if getattr(plantilla, campo, False):
            valor = datos.get(campo)
            variables[campo] = "" if valor is None else str(valor)

    return variables


def send_message_twilio(numero: str, content_sid: str, variables: dict | None = None):
    with transaction.atomic():
        max_mensajes = int(config("TWILIO_MAX_MENSAJES_DIARIOS"))
        contador = ContadorTwilio.objects.select_for_update().get(id=1)
        hoy = date.today()
        # Si es otro día, reiniciar contador
        if contador.fecha != hoy:
            contador.fecha = hoy
            contador.contador = 0
            contador.save(update_fields=["fecha", "contador"])
        # Verificar límite
        if contador.contador >= max_mensajes:
            return {
                "error": (
                    f"Se alcanzó el límite diario de {max_mensajes} "
                    "mensajes de Twilio."
                )
                }

    client = Client(
        config("TWILIO_ACCOUNT_SID"),
        config("TWILIO_AUTH_TOKEN")
    )

    params = {
        "from_": f"whatsapp:+{config('TWILIO_WHATSAPP_NUMBER')}",
        "to": f"whatsapp:+{numero}",
        "content_sid": content_sid,
    }

    if variables:
        params["content_variables"] = json.dumps(variables)

    print("PARAMS", params)
    try:
        message = client.messages.create(**params)

        with transaction.atomic():
            contador = ContadorTwilio.objects.select_for_update().get(id=1)
            contador.contador += 1
            contador.save(update_fields=["contador"])
            
        return message

    except Exception as e:
        return {
            "error": str(e)
        }

