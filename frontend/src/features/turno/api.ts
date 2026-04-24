import http from '../../common/api/client'
import type { TurnoPacienteResp} from './types';


export type TurnosCountResult = {
  count: number;
  msj_recordatorio: number;
  msj_asignacion: number;
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
      msj_asignacion: Number(d.msj_asignacion ?? 0),
      msj_cancelacion: Number(d.msj_cancelacion ?? 0),
      msj_reprogramacion: Number(d.msj_reprogramacion ?? 0),
    };
  });
};



export const getTurnoPaciente = (id: string): Promise<TurnoPacienteResp> => {
  return http.get(`turno-paciente/`,{params: {id }}).then(res => res.data)
}

export const putTurnoPaciente = (id: string, estado:number) => {
  return http.put(`turno-paciente/`, { id, estado} )
}
