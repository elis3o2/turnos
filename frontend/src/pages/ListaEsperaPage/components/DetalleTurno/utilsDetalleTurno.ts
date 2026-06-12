import type { TurnoEspera } from "../../../../features/turno_espera/types";

export type TelefonoEstado = "missing" | "valid" | "invalid";

export function getTelefonoEstado(
  carac: string | null | undefined,
  nro: string | null | undefined
): TelefonoEstado {
  if (carac == null || nro == null) return "missing";
  if (2 <= carac.length && carac.length <= 4 && (carac.length +  nro.length === 10)) return "valid";
  return "invalid";
}

export function getTelefonoTooltipText(status: TelefonoEstado): string {
  switch (status) {
    case "valid":
      return "Teléfono válido";
    case "missing":
      return "Teléfono no cargado";
    case "invalid":
      return "Teléfono no válido";
  }
}

export function telefonoCompleto(
  carac: string | null | undefined,
  nro: string | null | undefined
): string {
  return `${carac || "-"} - ${nro || "-"}`;
}

export function medicoSolicitanteLabel(t: TurnoEspera): string {
  const apellido = t.profesional_solicitante?.apellido ?? "";
  const nombre = t.profesional_solicitante?.nombre ?? "";

  if (apellido || nombre) {
    return `${apellido}${apellido && nombre ? ", " : ""}${nombre}`;
  }

  return "No registrado";
}

export function diasEnEsperaNumber(t: TurnoEspera): number {
  try {
    const fecha = new Date(t.fecha_hora_creacion);
    const fechaMid = new Date(
      fecha.getFullYear(),
      fecha.getMonth(),
      fecha.getDate()
    ).getTime();

    const today = new Date();
    const todayMid = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    ).getTime();

    const days = Math.floor((todayMid - fechaMid) / (1000 * 60 * 60 * 24));
    return days >= 0 ? days : 0;
  } catch {
    return 0;
  }
}

export function pacienteLabel(t: TurnoEspera): string {
  console.log(t)
  const apellido = t.paciente?.apellido ?? "";
  const nombre = t.paciente?.nombre ?? "";
  const dni = t.paciente?.nro_doc ? ` · DNI: ${t.paciente.nro_doc}` : "";

  return `${apellido}${nombre ? `, ${nombre}` : ""}${dni}`;
}

export function pacienteSexoFechaLabel(t: TurnoEspera): string {
  const sexo = t.paciente?.sexo ?? "";
  const fechaNacimiento = String(t.paciente?.fecha_nacimiento ?? "");
  return `Sexo: ${sexo} · Fecha de nacimiento: ${fechaNacimiento}`;
}

export function tieneEstudiosPendientes(turno: TurnoEspera | null): boolean {
  return !!turno?.estudios_requerido?.some((e) => e.estado === false);
}

export function puedeSacarTurno(
  selectedDerivacion: number | null,
  activeTurno: TurnoEspera | null
): boolean {
  return selectedDerivacion === null || !!activeTurno?.cupo;
}