import type { Profesional } from "../../types";

export function parseProfesionalesResponse(data: unknown): Profesional[] {
  if (Array.isArray(data)) return data as Profesional[];
  if (data && typeof data === "object") return [data as Profesional];
  return [];
}

export function getProfesionalDisplayName(p: Profesional | null): string {
  if (!p) return "-";
  return `${p.apellido ?? "-"}, ${p.nombre ?? "-"}`;
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error) return error.message || fallback;

  if (typeof error === "object" && error !== null && "response" in error) {
    const err = error as {
      response?: { data?: { detail?: string } | string };
      message?: string;
    };

    const msg =
      err?.response?.data ??
      err?.message;

    if (typeof msg === "string" && msg.trim()) return msg;
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    const msg = (error as { message?: unknown }).message;
    if (typeof msg === "string" && msg.trim()) return msg;
  }

  return fallback;
}