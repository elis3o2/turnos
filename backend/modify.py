from django.db import connections

def liberar_turno(idturno):
    with connections["informix"].cursor() as cursor:
        cursor.execute("""
            UPDATE turnos
            SET 
                idpaciente = NULL,
                idestadoturno = 1,
                usuario = 'nsensin0',
                fechaultmdf = CURRENT
            WHERE 
                idturno = %s
                AND idestadoturno = 3
        """, [idturno])

        filas = cursor.rowcount

    if filas == 1:
        return {"ok": True}
    else:
        return {"ok": False, "error": "No existe o estado inválido"}