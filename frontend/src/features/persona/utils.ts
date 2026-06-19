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


export const pacienteLabel = (p: Paciente | null) => {
  const apellido = p?.apellido ?? "";
  const nombre = p?.nombre ?? "";
  const dni = p?.nro_doc ?? null;
  if (apellido || nombre) {
    const base = `${apellido}${apellido && nombre ? ", " : ""}${nombre}`;
    return dni ? `${base} · DNI: ${dni}` : base;
  }
  return dni ? `Paciente · DNI: ${dni}` : "Paciente sin datos";
};

export function pacienteSexoFechaLabel(p: Paciente): string {
  const sexo = p.sexo ?? "";
  const fechaNacimiento = String(p.fecha_nacimiento ?? "");
  return `Sexo: ${sexo} · Fecha de nacimiento: ${fechaNacimiento}`;
}

export function telefonoCompleto(
  carac: string | null | undefined,
  nro: string | null | undefined
): string {
  return `${carac || "-"} - ${nro || "-"}`;
}


export function getTelefonoEstado(carac: string | null | undefined, nro: string | null | undefined): TelefonoEstado {
  if (carac == null || nro == null) return "missing";
  if (2 <= carac.length && carac.length <= 4 && (carac.length +  nro.length === 10)) return "valid";
  return "invalid";
}



export type PhoneAlert =
  | { severity: "info" | "success" | "warning"; message: string }
  | null;

export function getPhoneAlert(paciente: Paciente | null): PhoneAlert {
  if (!paciente) return null;

  const carac = paciente.carac_telef?.trim() ?? "";
  const nro = paciente.nro_telef?.trim() ?? "";

  const estado = getTelefonoEstado(
    paciente.carac_telef,
    paciente.nro_telef
  );

  switch (estado) {
    case "missing":
      return {
        severity: "info",
        message: "El paciente no tiene teléfono registrado.",
      };

    case "valid":
      return {
        severity: "success",
        message: `Teléfono válido: ${carac} - ${nro}`,
      };

    case "invalid":
      return {
        severity: "warning",
        message: "Teléfono inválido.",
      };

    default:
      return null;
  }
}


export function formatPacienteDireccion(p: Paciente | null): string {
  const calle = p?.nombre_calle ?? "-";
  const altura = p?.numero_calle ?? "";
  return `${calle} ${altura}`.trim();
}
