import http from '../../common/api/client'
import type {  TurnoHistorico, TurnoMergedFilters, TurnoMergedResp } from './types';

// Obtener todos los turnos con un límite de cantidad
export const getTurnosMerged = (filters: TurnoMergedFilters): Promise<TurnoMergedResp> => {
  return http.get<TurnoMergedResp>('informix/turnos-merged-all-list/', { params: filters}).then(res => res.data);
};


// Obtener todos los turnos con un límite de cantidad
export const getTurnosMergedError = (filters: TurnoMergedFilters): Promise<TurnoMergedResp> => {
  return http.get<TurnoMergedResp>('informix/turnos-merged-error/', { params: filters}).then(res => res.data);
};


export const getTurnosMergedRespuesta = (filters: TurnoMergedFilters): Promise<TurnoMergedResp> => {
  return http.get<TurnoMergedResp>('informix/turnos-merged-respuesta/', { params: filters }).then(res => res.data);
};


export const downloadTurnosMerged = (filters: TurnoMergedFilters): Promise<Blob> =>
  http.get<Blob>('informix/turnos-merged-all-list/', {
    params: { ...filters, csv: 1 },
    responseType: 'blob',
  }).then(res => res.data);


export const downloadTurnosMergedError = (filters: TurnoMergedFilters): Promise<Blob> =>
  http.get<Blob>('informix/turnos-merged-error/', {
    params: { ...filters, csv: 1 },
    responseType: 'blob',
  }).then(res => res.data);


export const downloadTurnosMergedRespuesta = (filters: TurnoMergedFilters): Promise<Blob> =>
  http.get<Blob>('informix/turnos-merged-alerta/', {
    params: { ...filters, csv: 1 },
    responseType: 'blob',
  }).then(res => res.data);



export const getHistoricoTurno = (id:number): Promise<TurnoHistorico> => {
  return http.get<TurnoHistorico>(`informix/get_historico/?id=${id}`).then(res => res.data);
}


