from django.db import connections, DatabaseError, IntegrityError
from src.models import Turno


def chunked(lst, size=300):
    for i in range(0, len(lst), size):
        yield lst[i:i + size]


def update_state():

    ids = list(
        Turno.objects
        .filter(id_estado__id=1, id_sisr__isnull=False)
        .values_list("id_sisr", flat=True)
        .distinct()
    )

    if not ids:
        print("No hay turnos para procesar")
        return

    fin = rep = sus = errores = 0

    try:
        with connections["informix"].cursor() as cur:

            for ids_chunk in chunked(ids, 300):

                placeholders = ",".join(["?"] * len(ids_chunk))

                query = f"""
                    SELECT idturno, idestadoturno
                    FROM turnos
                    WHERE idturno IN ({placeholders})
                    AND idestadoturno != 3
                """

                cur.execute(query, [str(i) for i in ids_chunk])

                for sisr_id, est in cur.fetchall():

                    sisr_id = str(sisr_id)
                    est = str(est)

                    if est in ("4", "5", "6"):
                        nuevo_estado = 4
                    elif est == "8":
                        nuevo_estado = 3
                    elif est in ("7", "2"):
                        nuevo_estado = 2
                    else:
                        continue

                    turnos = Turno.objects.filter(
                        id_sisr=sisr_id,
                        id_estado__id=1
                    )

                    for turno in turnos:
                        try:
                            turno.id_estado_id = nuevo_estado
                            turno.save(update_fields=["id_estado"])

                            if nuevo_estado == 4:
                                fin += 1
                            elif nuevo_estado == 3:
                                rep += 1
                            elif nuevo_estado == 2:
                                sus += 1

                        except IntegrityError as e:
                            errores += 1
                            print(
                                "[ERROR DUPLICADO]",
                                f"id={turno.id}",
                                f"id_sisr={turno.id_sisr}",
                                f"paciente={turno.id_paciente}",
                                f"estado_actual={turno.id_estado_id}",
                                f"nuevo_estado={nuevo_estado}",
                                "|",
                                e
                            )
                            continue

    except DatabaseError as e:
        print("Error de base de datos Informix:", e)
        return

    print("FINALIZADOS:", fin)
    print("REPROGRAMADOS:", rep)
    print("SUSPENDIDOS:", sus)
    print("ERRORES IGNORADOS:", errores)

