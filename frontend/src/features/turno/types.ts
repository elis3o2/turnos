import type {EfeSerEsp } from "../efector/types";
import type { EstadoMsj } from "../mensaje/types";

export interface Turno {
    id: number;
    id_estado: EstadoMsj;
    fecha: string | null;
    hora: string;
    msj_asignado: number;
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


export interface TurnoPacienteResp {
    nombre: string
    apellido: string
    fecha: string
    hora: string
    efector: string
    servicio: string
    especialidad: string
    estado_pac:number
    estado: string
}


