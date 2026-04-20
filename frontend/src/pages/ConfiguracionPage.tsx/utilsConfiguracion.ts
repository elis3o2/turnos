import type { Servicio } from '../../features/efector/types';

export type FieldName =
  | "asignacion"
  | "reprogramacion"
  | "cancelacion"
  | "recordatorio";

// ---------------------- Helpers de colecciones ----------------------

/**
 * Fusiona dos arrays de Servicio eliminando duplicados por id.
 * El segundo array tiene precedencia en caso de colisión.
 */
export const mergeServiciosUnique = (a: Servicio[], b: Servicio[]): Servicio[] => {
  const map = new Map<number, Servicio>();
  for (const s of a) map.set(s.id, s);
  for (const s of b) map.set(s.id, s);
  return Array.from(map.values());
};

/**
 * Devuelve una nueva copia del mapa service_id → efector_ids[]
 * con efectorId agregado al set del servicioId dado.
 */
export const addEfectorToServicio = (
  prev: Record<number, number[]>,
  servicioId: number,
  efectorId: number,
): Record<number, number[]> => {
  const next = { ...prev };
  next[servicioId] = Array.from(new Set([...(next[servicioId] ?? []), efectorId]));
  return next;
};

/**
 * Devuelve una nueva copia del mapa service_id → efector_ids[]
 * con efectorId removido del set del servicioId dado.
 * Si el set queda vacío, elimina la clave.
 */
export const removeEfectorFromServicio = (
  prev: Record<number, number[]>,
  servicioId: number,
  efectorId: number,
): Record<number, number[]> => {
  if (!prev[servicioId]) return prev;
  const next = { ...prev };
  const arr = next[servicioId].filter(id => id !== efectorId);
  if (arr.length === 0) {
    delete next[servicioId];
  } else {
    next[servicioId] = arr;
  }
  return next;
};

/**
 * Aplica addEfectorToServicio sobre un array de servicios completo.
 */
export const addEfectorToServicios = (
  prev: Record<number, number[]>,
  servicios: { id: number }[],
  efectorId: number,
): Record<number, number[]> => {
  let next = { ...prev };
  for (const s of servicios) {
    next = addEfectorToServicio(next, s.id, efectorId);
  }
  return next;
};

/**
 * Aplica removeEfectorFromServicio sobre un array de servicios completo.
 */
export const removeEfectorFromServicios = (
  prev: Record<number, number[]>,
  servicios: { id: number }[],
  efectorId: number,
): Record<number, number[]> => {
  let next = { ...prev };
  for (const s of servicios) {
    next = removeEfectorFromServicio(next, s.id, efectorId);
  }
  return next;
};