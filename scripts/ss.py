from django.db import connections
with connections["informix"].cursor() as cursor:
    cursor.execute("""
        SELECT
            t.idestadoturno,
            COUNT(*) AS cantidad
        FROM turnos t
        JOIN efecservesp es
            ON es.idefecservesp = t.idefecsernesp
        WHERE es.idefector IN (1, 7,11, 22, 24)
          AND t.fecha >= ?
          AND t.fecha < ?
        GROUP BY t.idestadoturno
        ORDER BY t.idestadoturno
    """, ["2026-05-01", "2026-06-01"])
    for idestadoturno, cantidad in cursor.fetchall():
        print(
            f"idestadoturno={idestadoturno}: {cantidad}"
        )