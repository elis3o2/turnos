from collections import defaultdict
from django.db import connections
from src.models import Mensaje, Turno


def cantidad_turnos_por_estado():

    # 1. Mensajes válidos
    mensajes = Mensaje.objects.filter(estado__gte=0)

    # Turnos de noviembre (excluir servicios 68 y 77)
    id_turnos_noviembre = mensajes.filter(
        fecha_envio__month=11
    ).values_list('id_turno', flat=True)

    turnos_noviembre = Turno.objects.filter(
        id__in=id_turnos_noviembre,
        id_sisr__isnull=False
    ).exclude(
        id_efe_ser_esp__id_servicio__id__in=(68, 77)
    )

    # Turnos del resto de los meses (todos los servicios)
    id_turnos_otro_mes = mensajes.exclude(
        fecha_envio__month=11
    ).values_list('id_turno', flat=True)

    turnos_otro_mes = Turno.objects.filter(
        id__in=id_turnos_otro_mes,
        id_sisr__isnull=False
    )

    # 2. Unir conjuntos (YA filtrados)
    turnos = turnos_noviembre.union(turnos_otro_mes)

    id_sisr_list = list(
        turnos.values_list('id_sisr', flat=True)
    )

    if not id_sisr_list:
        return {}

    # 3. Informix
    placeholders = ','.join(['?'] * len(id_sisr_list))

    sql = f"""
        SELECT idestadoturno, COUNT(*) AS cantidad
        FROM turnos
        WHERE idturno IN ({placeholders})
        GROUP BY idestadoturno
    """

    resultados = defaultdict(int)

    with connections['informix'].cursor() as cur:
        cur.execute(sql, id_sisr_list)
        for id_estado, cantidad in cur.fetchall():
            resultados[id_estado] += cantidad

    return dict(resultados)
