import type { Plantilla } from '../../features/mensaje/types';

// ---------------------- Tipos ----------------------
export type AlertSeverity = 'error' | 'warning' | 'info' | 'success';

export type StateShape = {
  especialidades?: number[];
  efectorId?: number;
  field?: string;
};

export type PlantillaPayload = {
  [campo: string]: number | string | undefined;
  dias_antes?: number;
};

// ---------------------- Mapas ----------------------
export const TIPO_TO_ID: Record<string, number> = {
  asignacion:    1,
  cancelacion:   2,
  reprogramacion: 3,
  recordatorio:  4,
};

export const ID_TO_TIPO_KEY: Record<number, string> = {
  1: 'asignacion',
  2: 'cancelacion',
  3: 'reprogramacion',
  4: 'recordatorio',
};

export const TIPO_TO_CAMPO: Record<string, string> = {
  asignacion:    'plantilla_asig',
  cancelacion:   'plantilla_canc',
  reprogramacion: 'plantilla_repr',
  recordatorio:  'plantilla_reco',
};

export const TIPO_TO_LABEL: Record<string, string> = {
  asignacion:    'Asignación',
  reprogramacion: 'Reprogramación',
  cancelacion:   'Cancelación',
  recordatorio:  'Recordatorio',
};

/** Claves de tipo en el orden definido por TIPO_TO_LABEL */
export const TIPO_KEYS = Object.keys(TIPO_TO_LABEL) as (keyof typeof TIPO_TO_LABEL)[];

// ---------------------- Funciones puras ----------------------

/** Agrupa un array de plantillas por tipo, usando ID_TO_TIPO_KEY para normalizar. */
export const groupPlantillasByType = (
  plantillas: Plantilla[],
): Record<string, Plantilla[]> => {
  const groups: Record<string, Plantilla[]> = {
    asignacion:    [],
    reprogramacion: [],
    cancelacion:   [],
    recordatorio:  [],
  };

  for (const p of plantillas) {
    const key = ID_TO_TIPO_KEY[(p as Plantilla & { id_tipo: number }).id_tipo];
    if (key && key in groups) {
      groups[key].push(p);
    }
  }

  return groups;
};

/**
 * Valida el campo "días antes" para recordatorios.
 * Retorna un mensaje de error o null si es válido.
 */
export const validateDiasAntes = (value: string): string | null => {
  if (!value || isNaN(Number(value))) {
    return 'Por favor ingrese un número válido de días antes.';
  }
  const num = Number(value);
  if (num < 0 || num > 5) {
    return 'Por favor ingrese un número entre 0 y 5.';
  }
  return null;
};

/** Construye el payload para updateEfectorPlantilla. */
export const buildPlantillaPayload = (
  tipo: string,
  plantillaId: number,
  diasAntes?: number,
): PlantillaPayload => {
  const campo = TIPO_TO_CAMPO[tipo] ?? 'plantilla_reco';
  const payload: PlantillaPayload = {
    [tipo]: 1,
    [campo]: plantillaId,
  };
  if (tipo === 'recordatorio' && diasAntes !== undefined) {
    payload['dias_antes'] = diasAntes;
  }
  return payload;
};