import { useMemo } from "react";
import type { TurnoEspera } from "@/features/turno_espera/types";
import { puedeSacarTurno, tieneEstudiosPendientes } from "./utilsDetalleTurno";

interface UseDetalleTurnoParams {
  activeTurno: TurnoEspera | null;
  selectedEstudios: number[];
  selectedDerivacion: number | null;
  isRemoving: (id?: number | null) => boolean;
}

export function useDetalleTurno({
  activeTurno,
  selectedEstudios,
  selectedDerivacion,
  isRemoving,
}: UseDetalleTurnoParams) {


  const puedeEliminar = useMemo(
    () => puedeSacarTurno(selectedDerivacion, activeTurno),
    [selectedDerivacion, activeTurno]
  );

  const tienePendientes = useMemo(
    () => tieneEstudiosPendientes(activeTurno),
    [activeTurno]
  );

  const deshabilitarGuardar = !activeTurno || selectedEstudios.length === 0;

  return {
    puedeEliminar,
    tienePendientes,
    deshabilitarGuardar,
    isRemovingActual: isRemoving(activeTurno?.id),
  };
}