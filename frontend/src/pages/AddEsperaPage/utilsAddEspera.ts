import type { Efector, EfeSerEspCompleto } from "../../features/efector/types";
import type { Paciente, Profesional } from "../../features/persona/types";

export const canSelectPriority = (
  efector: Efector | null,
  efectorId: number | null,
  paciente: Paciente | null,
  profesional: Profesional | null,
  efeSerEspSeleccionado: EfeSerEspCompleto | null,
  finishProfesionalDeriva: boolean,
  finishEstudioRequerido: boolean,
  finishObservaciones: boolean
): boolean =>
  Boolean((efector || efectorId) && paciente && profesional && efeSerEspSeleccionado && finishProfesionalDeriva && finishEstudioRequerido && finishObservaciones);

export const canConfirm = (
  efector: Efector | null,
  efectorId: number | null,
  paciente: Paciente | null,
  profesional: Profesional | null,
  efeSerEspSeleccionado: EfeSerEspCompleto | null,
  priority: string | null
): boolean =>
  Boolean((efector || efectorId) && paciente && profesional && efeSerEspSeleccionado && priority);