from django.utils.timezone import now
import requests
from .models import Mensaje, EfeSerEspPlantilla
from datetime import datetime, date
from .models import Plantilla
from src.apps.turno.models import Turno
from decouple import config
import emoji
import re
import json
from django.conf import settings
from twilio.rest import Client
from django.utils.timezone import make_aware
from django.db import transaction

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



def check_turno(efe_ser_esp: int, estado: int) -> (bool, Plantilla | None):
    """
    Revisa si el efe_ser_esp tiene la bandera del estado encendida y si es asi
    devuelve la Plantilla asociada
    """
    try:
        turno = EfeSerEspPlantilla.objects.filter(
            efe_ser_esp=efe_ser_esp,
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



def update_msg_state(mensaje: Mensaje) -> Mensaje:
    """
    Consulta la API externa por el estado del mensaje y actualiza Mensaje.
    Devuelve el Mensaje actualizado o el original si hay error.
    """

    api_url = (
        f'{config("API_ESTADO_WHATSAPP")}/'
        f'{mensaje.sesion_id}/{mensaje.id_mensaje}/{mensaje.numero}'
    )

    session = requests.Session()
    session.trust_env = False

    try:
        resp = session.get(
            api_url,
            headers={
                "Content-Type": "application/json",
                "Accept": "application/json",
            },
            timeout=5,
        )

        content_type = resp.headers.get("Content-Type", "")

        if "application/json" not in content_type:
            print("Content-Type inválido:", content_type)
            return mensaje

        data = resp.json()

        if isinstance(data, str):
            data = json.loads(data)

    except requests.exceptions.RequestException as e:
        return mensaje

    except ValueError as e:
        return mensaje

    # Actualizar mensaje
    try:
        mensaje.fecha_last_ack = now()

        if isinstance(data, dict):
            if "ack" in data:
                mensaje.estado_id = int(data["ack"])

        mensaje.save(update_fields=["fecha_last_ack", "estado_id"])

        return mensaje

    except Exception as e:
        print("SAVE ERROR:", e)
        return mensaje



def update_msg_state_twilio(mensaje: Mensaje) -> Mensaje:
    """
    Consulta Twilio por el estado del mensaje y actualiza Mensaje.
    Usa date_updated de Twilio como fecha_last_ack.
    Devuelve el Mensaje actualizado o el original si hay error.
    """

    try:
        client = Client(
            config("TWILIO_ACCOUNT_SID"),
            config("TWILIO_AUTH_TOKEN")
        )

        twilio_msg = client.messages(mensaje.id_mensaje).fetch()

    except Exception as e:
        print("TWILIO ERROR:", e)
        return mensaje

    try:
        estados_twilio = {
            "queued": 0,
            "sending": 1,
            "sent": 1,
            "delivered": 2,
            "read": 3,
            "failed": -1,
            "undelivered": -2,
        }

        if twilio_msg.status in estados_twilio:
            mensaje.estado_id = estados_twilio[twilio_msg.status]

        # date_updated viene como datetime con timezone UTC
        if twilio_msg.date_updated:
            mensaje.fecha_last_ack = twilio_msg.date_updated.replace(tzinfo=None)

        mensaje.save(
            update_fields=[
                "fecha_last_ack",
                "estado_id",
            ]
        )

        return mensaje

    except Exception as e:
        print("SAVE ERROR:", e)
        return mensaje


def sendMessage(body: str, to: str):
    """
    Envía un mensaje de WhatsApp mediante Twilio respetando
    el límite diario configurado.
    """

    account_sid = config("TWILIO_ACCOUNT_SID")
    auth_token = config("TWILIO_AUTH_TOKEN")
    from_number = f'whatsapp:+{config("TWILIO_WHATSAPP_NUMBER")}'

    if not to.startswith("whatsapp:"):
        if not to.startswith("+"):
            to = "+" + to
        to = f"whatsapp:{to}"


    client = Client(account_sid, auth_token)

    return client.messages.create(
        body=body,
        from_=from_number,
        to=to,
    )



transaction.atomic
def procesar_estado_mensaje(data):
    """
    Procesa un webhook de cambio de estado enviado por Twilio.
    """

    sid = data.get("SmsSid")
    estado = data.get("SmsStatus")
    error_code = data.get("ErrorCode")

    if not sid or not estado:
        return

    estados = {
        "failed": -1,
        "undelivered": -5,
        "sent": 1,
        "delivered": 2,
        "read": 3,
    }

    errors = {
        63024: -2,
        21211: -3,
        63018: -5,
        21654: -5,
        21619: -5,
        21656: -5,
    }

    nuevo_estado = estados.get(estado)

    if error_code:
        try:
            nuevo_estado = errors.get(int(error_code), nuevo_estado)
        except ValueError:
            pass

    if nuevo_estado is None:
        return

    try:
        msg = Mensaje.objects.select_for_update().get(id_mensaje=sid)

        if msg.estado != nuevo_estado:
            msg.estado = nuevo_estado
            msg.fecha_last_ack = now()
            msg.save(update_fields=["estado", "fecha_last_ack"])

    except Mensaje.DoesNotExist:
        print(f"No existe mensaje con SID {sid}")