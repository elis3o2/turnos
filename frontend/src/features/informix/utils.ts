import type { TurnoHistorico, TurnoMerged } from "./types";

type ChipColor = 'success' | 'error' | 'warning' | 'info' | 'default';

const ESTADO_COLOR_MAP: Record<string, ChipColor> = {
  LIBRE:        'error',
  SUSPENDIDO:   'error',
  ASIGNADO:     'success',
  ATENDIDO:     'success',
  AUSENTE:      'error',
  RECEPCIONADO: 'info',
  ELIMINADO:    'error',
  REPROGRAMADO: 'warning',
};

export function estadoChipColor(t: TurnoHistorico | TurnoMerged): ChipColor {
  return ESTADO_COLOR_MAP[t.estado ?? ''] ?? 'default';
}



export function estadoRespChipColor(t: TurnoMerged): ChipColor {
  const map: Record<string, ChipColor> = {
    "SIN DATOS":     "info",
    "CONFIRMADO":    "success",
    "RECHAZADO":     "error",
    "INCORRECTO":    "warning",
    "SIN RESPUESTA": "warning",
  };
  return map[t.estado_paciente ?? ""] ?? "default";
}
