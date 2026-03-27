export interface Efector {
    id: number;
    nombre: string;
}

export interface Servicio{
    id: number;
    nombre: string;
}

export interface Especialidad {
    id: number;
    nombre: string;
}


export interface EfeSerEsp {
    id: number;
    id_efector: number;
    id_servicio: number;
    id_especialidad: number;
}


export interface SerEsp {
    id_ser: number;
    ser_nombre: string;
    especialidades: {id_esp:number, esp_nombre:string, id_efe_ser_esp:number}[]
}

export type EfeSerEspInc = {
  id_efector: number;
  id_servicio: number;
  id_sercivio: number
}

export interface EfeSerEspCompleto  {
    id: number;
    efector: Efector;
    servicio: Servicio;
    especialidad: Especialidad; 
}


