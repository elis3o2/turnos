import http from '../../common/api/client'
import type { Turno, TurnoExtend} from './types';
import type { EstadoMsj } from '../mensaje/types';

export const getTurnosAll = (
  id_servicio?: number,
  id_especialidad?: number,
  id_estado?: number
): Promise<Turno[]> => {
  let url = `turno/turnos/`;

  const params: string[] = [];
  if (id_servicio !== undefined) params.push(`id_servicio=${id_servicio}`);
  if (id_especialidad !== undefined) params.push(`id_especialidad=${id_especialidad}`);
  if (id_estado !== undefined) params.push(`id_estado=${id_estado}`);

  if (params.length > 0) {
    url += `?${params.join("&")}`;
  }
  return http.get<Turno[]>(url).then(res => res.data);
};

export type TurnosCountResult = {
  count: number;
  msj_recordatorio: number;
  msj_confirmacion: number;
  msj_cancelacion: number;
  msj_reprogramacion: number;
};

export const getTurnosCount = (
  id_servicio?: number | number[],
  id_especialidad?: number | number[],
  efectores?: number | number[],
  id_estado?: number
): Promise<TurnosCountResult> => {
  let url = `turno/turnos/count/`;
  const params: string[] = [];

  const toCsv = (val: number | number[] | undefined) =>
    Array.isArray(val) ? val.join(",") : val?.toString();

  const pushParam = (key: string, val?: number | number[]) => {
    const csv = toCsv(val);
    if (csv !== undefined) params.push(`${key}=${encodeURIComponent(csv)}`);
  };

  pushParam("id_ser_esp__id_servicio", id_servicio);
  pushParam("id_ser_esp__id_especialidad", id_especialidad);
  if (id_estado !== undefined) params.push(`id_estado=${encodeURIComponent(String(id_estado))}`);
  pushParam("id_efector", efectores);

  if (params.length > 0) {
    url += `?${params.join("&")}`;
  }

  return http.get<Partial<TurnosCountResult>>(url).then(res => {
    const d = res.data ?? {};
    return {
      count: Number(d.count ?? 0),
      msj_recordatorio: Number(d.msj_recordatorio ?? 0),
      msj_confirmacion: Number(d.msj_confirmacion ?? 0),
      msj_cancelacion: Number(d.msj_cancelacion ?? 0),
      msj_reprogramacion: Number(d.msj_reprogramacion ?? 0),
    };
  });
};
/**
 * Fallback: cuando no existe /turnos/count/ o falla, combinamos llamadas a getTurnosAll
 * y deduplicamos por id.
 */
export const getTurnosByCombinations = async (
  servicios?: number[],
  especialidades?: number[],
  id_estado?: number
): Promise<Turno[]> => {
  const servs = servicios && servicios.length ? servicios : [undefined];
  const esps = especialidades && especialidades.length ? especialidades : [undefined];

  const promises: Promise<Turno[]>[] = [];
  servs.forEach(s => {
    esps.forEach(es => {
      promises.push(getTurnosAll(s as any, es as any, id_estado));
    });
  });

  const results = await Promise.all(promises);
  const all = results.flat();
  // dedupe por id (si tu Turno usa otra clave, ajustá aquí)
  const unique = Array.from(new Map(all.map((t: any) => [t.id, t])).values());
  return unique;
};


// Obtener todos los turnos con un límite de cantidad
export const getTurnosMergedLimit = (cantidad: number, offset:number, efectores: number[], servicios: number[], fechaDesde: string | null, fechaHasta: string| null ): Promise<{response: TurnoExtend[], count:number}> => {
  if (cantidad <= 0) return Promise.resolve({response:[], count:0});
  const url = 'turnos-merged-all-list/';
  return http
    .get<{response: TurnoExtend[], count:number}>(url, { params: { cantidad, offset, efectores, servicios, fechaDesde, fechaHasta } })
    .then(res => res.data);
};

// Mantengo las funciones originales
export const getTurnosMergedAll = (ids?: Array<string | number>): Promise<TurnoExtend[]> => {
  if (ids && ids.length === 0) return Promise.resolve([]);
  const url = 'turnos-merged-all-list/';
  if (!ids) return http.get<TurnoExtend[]>(url).then(res => res.data);

  const idsCsv = ids.map(String).map(encodeURIComponent).join(',');
  return http.get<TurnoExtend[]>(url, { params: { ids: idsCsv } }).then(res => res.data);
};


// Obtener todos los turnos con un límite de cantidad
export const getTurnosErrorMergedLimit = (cantidad: number, offset:number, efectores: number[], servicios: number[], fechaDesde: string | null, fechaHasta: string| null ): Promise<{response: TurnoExtend[], count:number}> => {
  if (cantidad <= 0) return Promise.resolve({response:[], count:0});
  const url = 'turnos-merged-error/';
  return http
    .get<{response: TurnoExtend[], count:number}>(url, { params: { cantidad, offset, efectores, servicios, fechaDesde, fechaHasta } })
    .then(res => res.data);
};






export const getTurnosAlerta = (tipo: string, cantidad: number, offset:number, efectores: number[], servicios: number[], fechaDesde: string | null, fechaHasta: string| null ):
 Promise<{response: TurnoExtend[], count:number}> => {
  const url = 'turnos-merged-alerta/';

  return http.get<{response: TurnoExtend[], count:number}>(url, { params: { tipo, cantidad, offset, efectores, servicios, fechaDesde, fechaHasta }
   }).then(res => res.data);
};




export const getTurnosByIds = (ids: Array<string | number>): Promise<TurnoExtend[]> => {
  return getTurnosMergedAll(ids);
};


export const getEstadomsj = (id: number, id_mensaje: string, numero: string) => {
  return http.post('turno/get_last_ack/', { id, id_mensaje, numero });
};
export const getSignificado = async (id: number): Promise<EstadoMsj> => {
  return await http.get<EstadoMsj>(`turno/turno/estado_msj/${id}/`).then(res => res.data);
};


export const getHistoricoTurno = (id:number) => {
  return http.get(`turno/get_historico/?id=${id}`).then(res => res.data);
}

