import time
from datetime import datetime

from src.apps.mensaje.models import Mensaje
from src.apps.mensaje.services import update_msg_state_twilio  # ajustá import

fecha_desde = datetime(2026, 5, 24, 0, 0, 0)
    
mensajes = Mensaje.objects.filter(
    sesion="twi",
    estado_id__gt=0
).order_by("fecha_envio")
total = mensajes.count()
print(f"Se encontraron {total} mensajes")

for i, mensaje in enumerate(mensajes, start=1):
    try:
        print(f"[{i}/{total}] Procesando ID={mensaje.id}")
        update_msg_state_twilio(mensaje)
        time.sleep(1)
    except Exception as e:
        print(f"Error ID={mensaje.id}: {e}")


actualizados = Mensaje.objects.filter(estado=-1,fecha_envio__gt=fecha_desde).update(estado=0)

print(f"Actualizados: {actualizados}")