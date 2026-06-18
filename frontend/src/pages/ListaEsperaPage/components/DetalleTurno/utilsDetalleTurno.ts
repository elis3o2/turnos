import type { TurnoEspera } from "@/features/turno_espera/types";


export function tieneEstudiosPendientes(turno: TurnoEspera | null): boolean {
  return !!turno?.estudios_requerido?.some((e) => e.estado === false);
}

export function puedeSacarTurno(
  selectedDerivacion: number | null,
  activeTurno: TurnoEspera | null
): boolean {
  return selectedDerivacion === null || !!activeTurno?.cupo;
}