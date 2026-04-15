import type { EfeSerEsp, Especialidad } from "../efector/types";


export interface EstadoMsj {
    id: number;
    significado: string;
}



export interface Plantilla {
    id: number;
    contenido: string;
    tipo: number;
}


export interface EfeSerEspPlantilla {
    id: number;
    efe_ser_esp: EfeSerEsp;
    asignacion: number;
    plantilla_asig?: number;
    reprogramacion: number;
    plantilla_repr?: number;
    cancelacion: number;
    plantilla_canc?: number;
    recordatorio: number;
    plantilla_reco?: number;
    dias_antes?: number; 
}


export interface EfeSerEspPlantillaExtend {
    id: number;
    id_efe_ser_esp: number;
    id_efector: number;
    id_servicio: number;
    especialidad: Especialidad;
    asignacion: number;
    plantilla_asig?: Plantilla;
    reprogramacion: number;
    plantilla_repr?: Plantilla;
    cancelacion: number;
    plantilla_canc?: Plantilla;
    recordatorio: number;
    plantilla_reco?: Plantilla;
    dias_antes?: number; 
}

export type Mensaje = {
    id: number,
    numero: string,
    fecha_envio: string,
    estado: string,
    plantilla_id?: number,
    last_ack: string
}


export interface MensajeAsociado {
    CANCELACION? : Mensaje,
    ASIGNACION? : Mensaje
    REPROGRAMACION? : Mensaje
    RECORDATORIO? : Mensaje
}