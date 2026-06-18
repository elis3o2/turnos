import type { Profesional, Paciente, TelefonoEstado } from "./types";

export function profesionaLabel(p: Profesional | null): string {
  const apellido = p?.apellido ?? "";
  const nombre = p?.nombre ?? "";

  if (apellido || nombre) {
    return `${apellido}${apellido && nombre ? ", " : ""}${nombre}`;
  }

  return "No registrado";
}


export function formatPacienteNombre(p: Paciente | null): string {
  if (!p) return "-, -";
  return `${p.apellido ?? "-"}, ${p.nombre ?? "-"}`;
}


export function telefonoCompleto(
  carac: string | null | undefined,
  nro: string | null | undefined
): string {
  return `${carac || "-"} - ${nro || "-"}`;
}

export function pacienteLabel(p: Paciente): string {
  const apellido = p.apellido ?? "";
  const nombre = p.nombre ?? "";
  const dni = p.nro_doc ? ` · DNI: ${p.nro_doc}` : "";

  return `${apellido}${nombre ? `, ${nombre}` : ""}${dni}`;
}

export function pacienteSexoFechaLabel(p: Paciente): string {
  const sexo = p.sexo ?? "";
  const fechaNacimiento = String(p.fecha_nacimiento ?? "");
  return `Sexo: ${sexo} · Fecha de nacimiento: ${fechaNacimiento}`;
}


export function getTelefonoEstado(carac: string | null | undefined, nro: string | null | undefined): TelefonoEstado {
  if (carac == null || nro == null) return "missing";
  if (2 <= carac.length && carac.length <= 4 && (carac.length +  nro.length === 10)) return "valid";
  return "invalid";
}
