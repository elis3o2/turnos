import http from '../../common/api/client'
import type { Estudio, EstudioRequerido, TurnoEspera } from './types';

export const getTurnoEsperaAbierto = (id: number) :Promise<TurnoEspera[]> =>{
  return http.get<TurnoEspera[]>(`turno_espera/turno_espera/espera/?id_efector=${id}`).then(res => res.data);
}

export const getTurnoEsperaAbiertoDeriva = (id: number, id_deriva: number) : Promise<TurnoEspera[]> => {
  return http.get<TurnoEspera[]>(`turno_espera/turno_espera/deriva/?id_efector=${id}&id_deriva=${id_deriva}`).then(res => res.data);
}

export const postTurnoEspera = (id_efe_ser_esp: number, id_profesional_solicitante: number,
  id_efector_solicitante: number,id_paciente:number, ids_estudios_requerido: number[], prioridad: number, cupo:boolean ) => {
  
    return http.post("turno_espera/turno_espera/", {id_efe_ser_esp,id_profesional_solicitante,
    id_efector_solicitante,id_paciente, ids_estudios_requerido, prioridad, cupo,});
};


export const CloseTurnoEspera = (id: number) => {
  return http.post(`turno_espera/turno_espera/${id}/close/`).then(res => res.data);
}

export const getTurnoEsperaById= (id: number) => {
  return http.get(`turno_espera/turno_espera/paciente/?id=${id}`).then(res => res.data);
}

export const getEstudioRequeridoAll = () => {
  return http.get<Estudio[]>(`turno_espera/estudio_requerido/`).then(res => res.data)
} 

export const postMarcarEstudiosTurno = (idTurno: number, estudios: number[]): Promise<{ ok: boolean; actualizados: number; estudios:EstudioRequerido[] }> => {
  return http.post<{ ok: boolean; actualizados: number; estudios:EstudioRequerido[] }>(`turno_espera/turno_espera/${idTurno}/marcar-estudios/`,{ estudios }).then(res => res.data);
};


