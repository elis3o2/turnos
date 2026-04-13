import type { MensajeAsociado } from "../mensaje/types";



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


export type TurnoHistorico = {
  idturno: number;
  fecha_hora_mdf: string;
  estado: string;
  paciente_nombre: string;
  paciente_apellido: string;
  nro_doc: string;
  profesional_nombre: string;
  profesional_apellido: string;
  fecha: string;
  hora: string;
  efector: string;
  servicio: string;
  especialidad: string;
};