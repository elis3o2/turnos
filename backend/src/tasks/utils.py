import requests
from rest_framework import status
from src.apps.mensaje.models import Mensaje
from core.settings import HORA_INICIO, HORA_FIN, TZ
from decouple import config
from django.utils import timezone
from django.core import signing
from rest_framework.response import Response
from datetime import datetime, timedelta


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
