import type { Paciente } from "../../types";

export type PhoneAlert =
  | { severity: "info" | "success" | "warning"; message: string }
  | null;

export function parsePacientesResponse(data: unknown): Paciente[] {
  if (Array.isArray(data)) return data as Paciente[];
  if (data && typeof data === "object") return [data as Paciente];
  return [];
}

export function formatPacienteNombre(p: Paciente | null): string {
  if (!p) return "-, -";
  return `${p.apellido ?? "-"}, ${p.nombre ?? "-"}`;
}

export function formatPacienteDni(p: Paciente | null): string {
  return p?.nro_doc ?? "-";
}

export function formatPacienteSexo(p: Paciente | null): string {
  return p?.sexo ?? "-";
}

export function formatPacienteFechaNacimiento(p: Paciente | null): string {
  return p?.fecha_nacimiento ? String(p.fecha_nacimiento) : "-";
}

export function formatPacienteDireccion(p: Paciente | null): string {
  const calle = p?.nombre_calle ?? "-";
  const altura = p?.numero_calle ?? "";
  return `${calle} ${altura}`.trim();
}

export function formatPacienteTelefono(p: Paciente | null): string {
  if (!p) return "- · -";
  return `${p.carac_telef ?? "-"} · ${p.nro_telef ?? "-"}`;
}



export function getPhoneAlert(paciente: Paciente | null): PhoneAlert {
  if (!paciente) return null;

  const carac = paciente.carac_telef?.trim() ?? "";
  const nro = paciente.nro_telef?.trim() ?? "";

  const caracBlank = carac === "";
  const nroBlank = nro === "";

  if (caracBlank && nroBlank) {
    return {
      severity: "info",
      message: "El paciente no tiene teléfono registrado.",
    };
  }

  const caracLen = carac.length;
  const nroLen = nro.length;

  const caracValida = caracLen >= 2 && caracLen <= 4;
  const telefonoValido = caracValida && caracLen + nroLen === 10;

  if (telefonoValido) {
    return {
      severity: "success",
      message: `Teléfono válido: ${carac} - ${nro}`,
    };
  }

  const messages: string[] = [];

  if (!caracValida) {
    messages.push("Característica inválida");
  }

  if (caracLen + nroLen !== 10) {
    messages.push("Teléfono inválido");
  }

  return {
    severity: "warning",
    message: messages.join(". "),
  };
}