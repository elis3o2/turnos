import type { Plantilla } from "../../features/mensaje/types";

// ─── Tipos ────────────────────────────────────────────────────────────────────
export type AlertSeverity = 'error' | 'warning' | 'info' | 'success';

export type StateShape = {
  especialidades?: number[];
  efectorId?: number;
  field?: string;
};

// ─── Mapas ────────────────────────────────────────────────────────────────────
export const TIPO_TO_ID: Record<string, number> = {
  asignacion:    1,
  cancelacion:   2,
  reprogramacion:3,
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
  reprogramacion:'plantilla_repr',
  recordatorio:  'plantilla_reco',
};

export const TIPO_TO_LABEL: Record<string, string> = {
  asignacion:    'Confirmación',
  reprogramacion:'Reprogramación',
  cancelacion:   'Cancelación',
  recordatorio:  'Recordatorio',
};

export const TIPO_TO_COLOR: Record<string, string> = {
  asignacion:    '#4caf50',
  reprogramacion:'#1976d2',
  cancelacion:   '#e53935',
  recordatorio:  '#fbc02d',
};

export const TIPO_KEYS = Object.keys(TIPO_TO_LABEL);

// ─── Helpers ──────────────────────────────────────────────────────────────────
export const groupPlantillasByType = (
  plantillas: Plantilla[],
): Record<string, Plantilla[]> => {
  const groups: Record<string, Plantilla[]> = {
    asignacion: [],
    reprogramacion: [],
    cancelacion: [],
    recordatorio: [],
  };

  for (const p of plantillas) {
    const key = p.tipo?.toLocaleLowerCase(); 
    if (key && key in groups) {
      groups[key].push(p);
    }
  }

  return groups;
};


export function validateDiasAntes(diasAntes: string): string | null {
  if (!diasAntes || isNaN(Number(diasAntes))) {
    return 'Por favor ingrese un número válido de días antes.';
  }
  const dias = Number(diasAntes);
  if (dias < 0 || dias > 5) {
    return 'Por favor ingrese un número entre 0 y 5.';
  }
  return null;
}

export function buildPlantillaPayload(
  tipo: string,
  plantillaId: number,
  diasAntes?: number,
): Record<string, any> {
  const campo = TIPO_TO_CAMPO[tipo] ?? 'plantilla_reco';
  const payload: Record<string, any> = {
    [tipo]: 1,
    [campo]: plantillaId,
  };
  if (tipo === 'recordatorio' && diasAntes !== undefined) {
    payload['dias_antes'] = diasAntes;
  }
  return payload;
}