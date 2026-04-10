import type {EfeSerEsp, EfeSerEspCompleto } from "../efector/types";
import type { EstadoMsj, MensajeAsociado } from "../mensaje/types";

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




export interface TurnoExtend {
    id: number;
    estado: EstadoTurno;
    estado_paciente: EstadoTurnoPaciente;
    fecha_estado_paciente: string;
    fecha: string;
    hora: string;
    msj_asignado: number;
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




export interface TurnoMerged {
    id: number;
    id_sisr: number;
    estado: string;
    estado_paciente: string;
    fecha_estado_paciente: string;
    fecha: string;
    hora: string;
    msj_asignado: number;
    msj_reprogramado: number;
    msj_cancelado: number;
    msj_recordatorio: number;
    efector: string;
    servicio: string;
    especialidad: string;
    paciente_nombre: string | null;
    paciente_apellido: string | null;
    paciente_dni: string | null;
    profesional_nombre: string | null;
    profesional_apellido: string | null;
    mensaje_asociado: MensajeAsociado;
}

export interface TurnoMergedFilters  {
  ids_efec: number[];
  ids_serv: number[];
  fecha_desde: string | null;
  fecha_hasta: string | null;
  cantidad: number;
  offset: number;
  tipo?: "rechazados" | "incorrectos" | "sin_respuesta";
};

export interface TurnoMergedResp {
    data: TurnoMerged[],
    count: number
}