from collections import defaultdict
from django.db import connections
from src.models import Mensaje, Turno
from django.db.models import Count


def verificar_estado():
    turnos = Turno.objects.all()

    id_sisr_list = list(
        turnos.values_list('id_sisr', flat=True)
    )


    placeholders = ','.join(['?'] * len(id_sisr_list))

    sql = f"""
        SELECT idestadoturno, COUNT(*) AS cantidad
        FROM turnoshistorico
        WHERE idturno IN ({placeholders})
        GROUP BY idestadoturno
    """

    resultados = defaultdict(int)

    with connections['informix'].cursor() as cur:
        cur.execute(sql, id_sisr_list)
        for id_estado, cantidad in cur.fetchall():
            resultados[id_estado] += cantidad

    print("RESEULTADO SISR ", resultados)


    resumen = (
        turnos
        .values('id_estado')
        .annotate(cantidad=Count('id_estado'))
    )

    print("RESULTADO DJANGO:", list(resumen))