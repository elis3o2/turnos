from django.db import connections
with connections["informix"].cursor() as cursor:
    cursor.execute("""
        SELECT *
        FROM cuposefector
        WHERE idefector = %s
          AND idefecservesp = %s
    """, [5, 982])
    columnas = [col[0] for col in cursor.description]
    filas = cursor.fetchall()
for fila in filas:
    registro = dict(zip(columnas, fila))
    print(registro)