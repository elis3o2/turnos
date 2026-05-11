# services/turnos_service.py

from typing import Any, Dict, List
from django.db.models import QuerySet
from decouple import config
from src.apps.mensaje.models import Mensaje, TurnoFlow, Flow
from src.apps.mensaje.services import update_msg_state
import emoji
import requests


def procesar_mensaje(m: Mensaje) -> dict:
    if 0 <= m.estado_id < 3:
        update_msg_state(m)

    return {
        "id": m.id,
        "numero": m.numero,
        "fecha_envio": m.fecha_envio,
        "estado": m.estado.significado,
        "plantilla_id": m.plantilla.id if m.plantilla else None,
        "fecha_last_ack": m.fecha_last_ack,
    }


def build_mensajes_map(turnos: List[Any]) -> Dict[int, list]:
    turno_ids = [t.id for t in turnos]

    mensajes = (
        Mensaje.objects
        .filter(turno_id__in=turno_ids)
        .select_related("plantilla__tipo", "estado")
        .order_by("-fecha_envio")
    )

    result: Dict[int, list] = {tid: [] for tid in turno_ids}

    for m in mensajes:
        result[m.turno_id].append(procesar_mensaje(m))

    return result




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