import requests
from .models import Mensaje, EfeSerEspPlantilla
from datetime import datetime
from .models import Plantilla
from src.apps.turno.models import Turno
from decouple import config

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
            mensaje.id_estado_id = data["ack"]

        mensaje.save(update_fields=["fecha_last_ack", "id_estado"])
        return mensaje

    except Exception:
        return mensaje

