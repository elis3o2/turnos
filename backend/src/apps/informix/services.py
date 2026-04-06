# services/turnos_service.py

from typing import Any, Dict, List
from django.db.models import QuerySet

from src.apps.mensaje.models import Mensaje, TurnoFlow, Flow
from src.utils.utils import update_msg_state
import emoji


def procesar_mensaje(m: Mensaje) -> dict:
    if 0 <= m.estado_id < 3:
        update_msg_state(m)



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


def build_fecha_estado_map(turnos: List[Any]) -> Dict[int, Any]:
    turno_ids = [t.id for t in turnos]

    flows = TurnoFlow.objects.filter(turno_id__in=turno_ids)

    flow_map = {}
    for f in flows:
        flow_map.setdefault(f.turno_id, []).append(f.flow_id)

    all_flow_ids = [fid for ids in flow_map.values() for fid in ids]

    flows_qs = Flow.objects.filter(id__in=all_flow_ids, plantilla_flow_id=1)

    flow_by_id = {f.id: f for f in flows_qs}

    result = {}

    for turno in turnos:
        ids = flow_map.get(turno.id, [])
        flows = [flow_by_id.get(fid) for fid in ids if fid in flow_by_id]

        if not flows:
            result[turno.id] = None
            continue

        if turno.estado_id in (1, 2):
            flow = min(flows, key=lambda x: x.fecha_cierre or x.fecha_inicio)
            result[turno.id] = flow.fecha_cierre
        else:
            flow = min(flows, key=lambda x: x.fecha_inicio)
            result[turno.id] = flow.fecha_inicio

    return result