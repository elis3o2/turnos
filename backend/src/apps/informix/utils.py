from typing import Any, Optional, Iterable
from src.apps.mensaje.models import Mensaje
from src.utils.utils import safe_int, parse_int_list

# ============================================================
# Helpers
# ============================================================

def asig_dic(row: tuple, dic: dict[str, dict[str, Any]]) -> None:
    turno_id = str(row[0])
    dic[turno_id] = {
        "paciente_id": row[1],
        "paciente_nombre": row[2],
        "paciente_apellido": row[3],
        "paciente_dni": row[4],
        "profesional_nombre": row[5],
        "profesional_apellido": row[6],
    }


def setear_pac(turno: Any, dic: dict[str, Any]) -> None:
    setattr(turno, "paciente_nombre", dic.get("paciente_nombre"))
    setattr(turno, "paciente_apellido", dic.get("paciente_apellido"))
    setattr(turno, "paciente_dni", dic.get("paciente_dni"))


def setear_prof(turno: Any, dic: dict[str, Any]) -> None:
    setattr(turno, "profesional_nombre", dic.get("profesional_nombre"))
    setattr(turno, "profesional_apellido", dic.get("profesional_apellido"))


def get_params(request) -> tuple[Optional[int], int, Optional[str], Optional[str], list[int], list[int]]:
    try:
        cantidad = safe_int(request.query_params.get("cantidad"), default=None)
        offset = safe_int(request.query_params.get("offset"), default=0) or 0

        fecha_desde = request.query_params.get("fechaDesde")
        fecha_hasta = request.query_params.get("fechaHasta")

        efectores_param = request.query_params.getlist("ids_efec[]")
        servicios_param = request.query_params.getlist("ids_serv[]")

        id_efectores = parse_int_list(efectores_param)
        id_servicios = parse_int_list(servicios_param)

        return cantidad, offset, fecha_desde, fecha_hasta, id_efectores, id_servicios
    except ValueError as e:
        raise ValueError("Parámetros numéricos inválidos") from e


def procesar_mensaje(m: Mensaje) -> dict[str, Any]:
    return {
        "id": m.id,
        "id_mensaje": m.id_mensaje,
        "numero": m.numero if m.numero else None,
        "fecha_envio": m.fecha_envio if m.fecha_envio else None,
        "estado": {
            "id": m.estado.id if m.estado else None,
            "significado": m.estado.significado if m.estado else None,
        } if m.estado else None,
        "plantilla": {
            "id": m.plantilla.id if m.plantilla else None,
            "contenido": m.plantilla.contenido if m.plantilla else None,
            "tipo": {
                "id": m.plantilla.tipo.id,
                "nombre": m.plantilla.tipo.nombre,
            } if m.plantilla and m.plantilla.tipo else None,
        } if m.plantilla else None,
        "fecha_last_ack": m.fecha_last_ack if m.fecha_last_ack else None,
    }
