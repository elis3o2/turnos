from decouple import config
import re
import logging
from rest_framework.response import Response
from rest_framework import status
from django.utils import timezone
from django.utils.timezone import now
from django.db import connections, DatabaseError
from datetime import timedelta, datetime, date, time
from zoneinfo import ZoneInfo
from django.core import signing
Row = [dict, any]
from decimal import Decimal
from .querys_informix import query_paciente_from_id, query_paciente_from_dni, query_profesional_from_id, query_profesional_from_nombre


# ─── helpers ──────────────────────────────────────────────────────────────────

def normalize(val):
    if val is None:
        return None
    if isinstance(val, (int, float, bool)):
        return val
    if isinstance(val, Decimal):
        return float(val)
    if isinstance(val, (date, datetime)):
        return val.isoformat()
    return str(val)  

def _rows_to_dicts(cursor):
    columns = [str(col[0]).lower() for col in cursor.description]

    results = []
    for row in cursor.fetchall():
        item = {}
        for col, val in zip(columns, row):
            item[col] = normalize(val)
        results.append(item)
    
    return results




# ─── fetch_paciente ───────────────────────────────────────────────────────────

def fetch_paciente(
    ids: list[int] | None = None,
    dni: str | None = None,
    ext: bool = False
) -> list[Row]:
    if ids is not None:
        if not ids:
            return []
        if ext:
            query = query_paciente_from_id_extend(len(ids))
        else:
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

