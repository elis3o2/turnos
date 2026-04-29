import { useMemo } from "react";
import type { TurnoEspera } from "../../../../features/turno_espera/types";
import {
  diasEnEsperaNumber,
  getTelefonoEstado,
  getTelefonoTooltipText,
  medicoSolicitanteLabel,
  pacienteLabel,
  pacienteSexoFechaLabel,
  puedeSacarTurno,
  tieneEstudiosPendientes,
  telefonoCompleto,
} from "./utilsDetalleTurno";

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
  const telefonoEstado = useMemo(() => {
    if (!activeTurno) return "missing" as const;
    
    return getTelefonoEstado(
      activeTurno.paciente?.carac_telef,
      activeTurno.paciente?.nro_telef
    );
  }, [activeTurno]);

  const telefonoTooltipText = useMemo(
    () => getTelefonoTooltipText(telefonoEstado),
    [telefonoEstado]
  );

  const telefonoTexto = useMemo(() => {
    if (!activeTurno) return "- -";
    return telefonoCompleto(
      activeTurno.paciente?.carac_telef,
      activeTurno.paciente?.nro_telef
    );
  }, [activeTurno]);

  const pacienteTexto = useMemo(() => {
    if (!activeTurno) return "";
    return pacienteLabel(activeTurno);
  }, [activeTurno]);

  const pacienteSexoFechaTexto = useMemo(() => {
    if (!activeTurno) return "";
    return pacienteSexoFechaLabel(activeTurno);
  }, [activeTurno]);

  const medicoSolicitanteTexto = useMemo(() => {
    if (!activeTurno) return "No registrado";
    return medicoSolicitanteLabel(activeTurno);
  }, [activeTurno]);

  const diasEnEspera = useMemo(() => {
    if (!activeTurno) return 0;
    return diasEnEsperaNumber(activeTurno);
  }, [activeTurno]);

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
    telefonoEstado,
    telefonoTooltipText,
    telefonoTexto,
    pacienteTexto,
    pacienteSexoFechaTexto,
    medicoSolicitanteTexto,
    diasEnEspera,
    puedeEliminar,
    tienePendientes,
    deshabilitarGuardar,
    isRemovingActual: isRemoving(activeTurno?.id),
  };
}