import type { EstudioRequerido } from "../../types";

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

export function filterEstudios(
  estudios: EstudioRequerido[],
  query: string
): EstudioRequerido[] {
  const q = query.toLowerCase();

  return estudios.filter((e) =>
    [e.nombre, e.id?.toString()]
      .join(" ")
      .toLowerCase()
      .includes(q)
  );
}