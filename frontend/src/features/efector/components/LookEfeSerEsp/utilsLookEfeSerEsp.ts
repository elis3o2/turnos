import type { SerEsp, Servicio, Deriva, Especialidad } from "../../types";
import { sortByNombre } from "@/common/utils/collections";

export const toServicio = (s: SerEsp): Servicio => ({ id: s.id_ser, nombre: s.ser_nombre } as Servicio);

export const toEspecialidad = (e: { id_esp: number; esp_nombre: string }): Especialidad => 
  ({ id: e.id_esp, nombre: e.esp_nombre } as Especialidad);


export function buildServiciosUnificados(sres: SerEsp[], dres: Deriva[]): Servicio[] {
  const map = new Map<number, Servicio>();
  sres.forEach((se) => { const s = toServicio(se); map.set(s.id, s); });
  dres.forEach((dv) => {
    const srv = dv.servicio_deriva;
    if (srv && !map.has(srv.id)) map.set(srv.id, srv);
  });
  return sortByNombre(Array.from(map.values()));
}
