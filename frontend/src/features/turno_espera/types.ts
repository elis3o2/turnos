import type { Paciente, Profesional, User } from "../persona/types";
import type { EstadoMsj } from "../mensaje/types";
import type { Efector, Servicio, Especialidad } from "../efector/types";

export interface TurnoEspera {
    id: number;
    estado: EstadoMsj;
    profesional_solicitante: Profesional;
    efector: Efector;
    servicio: Servicio;
    especialidad: Especialidad;
    efector_solicitante: Efector;
    paciente: Paciente;
    prioridad: number;
    estudios_requerido:  EstudioRequerido[];
    fecha_hora_creacion: string;
    fecha_hora_cierre: string | null;
    usuario_creacion: User;
    usuario_cierre: User | null;
    cupo: boolean;
}

export interface Estudio {
    id: number,
    nombre: string
}

export interface EstudioRequerido {
    id: number,
    estudio_requerido: {id: number, nombre: string},
    estado: boolean,
    fecha_cierre: string,
    usuario_cierre: number,
}
