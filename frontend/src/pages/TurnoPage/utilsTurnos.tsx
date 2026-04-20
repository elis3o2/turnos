import {
  getTurnosMerged,
  getTurnosMergedAlerta,
  getTurnosMergedError,
  downloadTurnosMerged,
  downloadTurnosMergedAlerta,
  downloadTurnosMergedError
} from "../../features/informix/api"
import type { TurnoMerged } from "../../features/informix/types";

// ─── tipos exportados ────────────────────────────────────────────────────────

export type AlertCategory = "rechazados" | "incorrectos" | "sin_respuesta";

export type AlertData = {
  count_total: number;
  grupos: {
    rechazados: TurnoMerged[];
    incorrectos: TurnoMerged[];
    sin_respuesta: TurnoMerged[];
  };
};

// ─── resolvers de endpoint ───────────────────────────────────────────────────

/** Elige el endpoint de consulta correcto según el modo activo. */
export function resolveEndpoint(mode: {
  errorMode: boolean;
  alertMode: boolean;
}): typeof getTurnosMerged {
  if (mode.alertMode) return getTurnosMergedAlerta;
  if (mode.errorMode) return getTurnosMergedError;
  return getTurnosMerged;
}

/** Elige el endpoint de descarga correcto según el modo activo. */
export function resolveDownloadEndpoint(mode: {
  errorMode: boolean;
  alertMode: boolean;
}): typeof downloadTurnosMerged {
  if (mode.alertMode) return downloadTurnosMergedAlerta;
  if (mode.errorMode) return downloadTurnosMergedError;
  return downloadTurnosMerged;
}

// ─── colores de chips ────────────────────────────────────────────────────────

export function estadoRespChipColor(
  t: TurnoMerged
): "info" | "success" | "error" | "warning" | "default" {
  const map: Record<string, "info" | "success" | "error" | "warning"> = {
    "SIN DATOS":     "info",
    CONFIRMADO:      "success",
    RECHAZADO:       "error",
    INCORRECTO:      "warning",
    "SIN RESPUESTA": "warning",
  };
  return map[t.estado_paciente ?? ""] ?? "default";
}

export function estadoChipColor(
  t: TurnoMerged
): "success" | "error" | "warning" | "info" | "default" {
  const map: Record<string, "success" | "error" | "warning" | "info"> = {
    LIBRE:         "error",
    SUSPENDIDO:    "error",
    ASIGNADO:      "success",
    ATENDIDO:      "success",
    AUSENTE:       "error",
    RECEPCIONADO:  "info",
    ELIMINADO:     "error",
    REPROGRAMADO:  "warning",
  };
  return map[t.estado ?? ""] ?? "default";
}

// ─── columnas de la tabla ────────────────────────────────────────────────────

export const ALL_COLUMNS = [
  { key: "id",            label: "ID" },
  { key: "respuesta",     label: "Respuesta" },
  { key: "dni",           label: "DNI" },
  { key: "nombre",        label: "Nombre" },
  { key: "apellido",      label: "Apellido" },
  { key: "efector",       label: "Efector" },
  { key: "servicio",      label: "Servicio" },
  { key: "especialidad",  label: "Especialidad" },
  { key: "prof_nombre",   label: "Nombre profesional" },
  { key: "prof_apellido", label: "Apellido profesional" },
  { key: "estado",        label: "Estado" },
  { key: "asignacion",    label: "Asignación" },
  { key: "cancelacion",   label: "Cancelación" },
  { key: "reprogramacion",label: "Reprogramación" },
  { key: "recordatorio",  label: "Recordatorio" },
  { key: "fecha",         label: "Fecha" },
  { key: "hora",          label: "Hora" },
] as const;

export const DEFAULT_VISIBLE_COLUMNS: string[] = [
  "respuesta", "dni", "efector", "servicio", "especialidad",
  "estado", "asignacion", "cancelacion", "reprogramacion", "recordatorio",
  "fecha", "hora",
];