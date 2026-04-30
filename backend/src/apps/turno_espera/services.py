from .models import TurnoEspera
from src.apps.turno.models import Turno
from datetime import datetime
from src.utils.querys_informix import query_turno_fecha
from django.db import connections

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
    turno.id_sisr = id_turno
    turno.save(update_fields=["id_estado_id", "id_sisr"])

    return True



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


