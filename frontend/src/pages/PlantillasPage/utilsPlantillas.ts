import type { Plantilla } from "@/features/mensaje/types";
import { TIPO_TO_CAMPO } from "@/features/mensaje/utils";
// ─── Tipos ────────────────────────────────────────────────────────────────────
export type AlertSeverity = 'error' | 'warning' | 'info' | 'success';

export type StateShape = {
  especialidades?: number[];
  efectorId?: number;
  field?: string;
};

// ─── Mapas ────────────────────────────────────────────────────────────────────


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