import type {EfeSerEsp, EfeSerEspCompleto } from "../efector/types";
import type { EstadoMsj } from "../mensaje/types";

export interface Turno {
    id: number;
    id_estado: EstadoMsj;
    fecha: string | null;
    hora: string;
    msj_confirmado: number;
    msj_reprogramado: number;
    msj_cancelado: number;
    msj_recordatorio: number;
    efe_ser_esp: EfeSerEsp;
}


export interface EstadoTurno {
    id: number,
    nombre: string
}

export interface EstadoTurnoPaciente {
    id: number,
    nombre: string
}




export interface TurnoExtend {
    id: number;
    estado: EstadoTurno;
    estado_paciente: EstadoTurnoPaciente;
    fecha_estado_paciente: string;
    fecha: string;
    hora: string;
    msj_confirmado: number;
    msj_reprogramado: number;
    msj_cancelado: number;
    msj_recordatorio: number;
    efe_ser_esp: EfeSerEspCompleto;
    paciente_nombre: string | null;
    paciente_apellido: string | null;
    paciente_dni: string | null;
    profesional_nombre: string | null;
    profesional_apellido: string | null;
    mensaje_asociado: any[] | undefined;
}


