import type { Efector, EfeSerEspCompleto } from "../../features/efector/types";
import type { Paciente, Profesional } from "../../features/persona/types";

export const mapPriority: Record<string, number> = { baja: 2, media: 1, alta: 0 };

export const canSelectPriority = (
  efector: Efector | null,
  efectorId: number | null,
  paciente: Paciente | null,
  profesional: Profesional | null,
  efeSerEspSeleccionado: EfeSerEspCompleto | null,
  finishEstudioRequerido: boolean
): boolean =>
  Boolean((efector || efectorId) && paciente && profesional && efeSerEspSeleccionado && finishEstudioRequerido);

export const canConfirm = (
  efector: Efector | null,
  efectorId: number | null,
  paciente: Paciente | null,
  profesional: Profesional | null,
  efeSerEspSeleccionado: EfeSerEspCompleto | null,
  priority: string | null
): boolean =>
  Boolean((efector || efectorId) && paciente && profesional && efeSerEspSeleccionado && priority);