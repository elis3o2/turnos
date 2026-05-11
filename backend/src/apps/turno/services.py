from .models import Turno
from datetime import date, time

def create_Turno(id_sisr: int, id_pac: int, id_est: int, 
                 id_ess: int, fecha: date, hora: time) -> Turno:
    t = Turno.objects.create(
            id_sisr=id_sisr,
            id_paciente=id_pac,
            estado_id=id_est,
            estado_paciente_id=0,
            msj_asignado=0,
            msj_reprogramado=0,
            msj_cancelado=0,
            msj_recordatorio=0,
            efe_ser_esp_id=id_ess,
            fecha=fecha,
            hora=hora
        )
    return t


def update_estado_Turno(id_sisr: int, id_pac: int, id_est: int) -> Turno | None: 
    try:
        # Obtener instancia
        t = Turno.objects.filter(id_sisr=id_sisr, id_paciente=id_pac).first()
        if t is None:
            print(f"[DEBUG] No existe Turno local con id={id_sisr} => se ignora notificación (estado={id_est})")
            return None

        # Asignar estado en la instancia y guardar (mínimo)
        if t.estado_id != id_est:
            t.estado_id = id_est
            t.save(update_fields=["estado_id"])

        print(f"[INFO] Actualizado Turno id={id_sisr} a estado={id_est}")
        return t
    
    except Exception as ex:
        print(f"[ERROR] al actualizar Turno id={id_sisr}: {ex}")
        return None
