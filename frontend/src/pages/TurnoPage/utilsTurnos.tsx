import {Box, Chip, Typography} from "@mui/material";
import {
  getTurnosMerged,
  getTurnosMergedRespuesta,
  getTurnosMergedError,
  downloadTurnosMerged,
  downloadTurnosMergedRespuesta,
  downloadTurnosMergedError
} from "@/features/informix/api"
import type { TurnoMerged } from "@/features/informix/types";
import type { Mensaje } from "@/features/mensaje/types";
import { DateTimeStack } from "@/common/components/DateTimeStack";
import { DateStack } from "@/common/components/DateStack";
import { estadoChipColor, estadoRespChipColor } from "@/features/informix/utils";

// ─── resolvers de endpoint ───────────────────────────────────────────────────

/** Elige el endpoint de consulta correcto según el modo activo. */
export function resolveEndpoint(mode: {
  errorMode: boolean;
  respuestaMode: boolean;
}): typeof getTurnosMerged {
  if (mode.respuestaMode) return getTurnosMergedRespuesta;
  if (mode.errorMode) return getTurnosMergedError;
  return getTurnosMerged;
}

/** Elige el endpoint de descarga correcto según el modo activo. */
export function resolveDownloadEndpoint(mode: {
  errorMode: boolean;
  respuestaMode: boolean;
}): typeof downloadTurnosMerged {
  if (mode.respuestaMode) return downloadTurnosMergedRespuesta;
  if (mode.errorMode) return downloadTurnosMergedError;
  return downloadTurnosMerged;
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

export function mensajeChip(m?: Mensaje | null) {
  if (!m) return <Typography variant="body2">—</Typography>;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, maxWidth: 120 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography fontSize={12}variant="body2">{m.estado}</Typography>
        {m.fecha_envio ? <DateTimeStack value={m.fecha_envio} /> : null}
      </Box>
    </Box>
  );
}

export function renderCell(columnKey: string, t: TurnoMerged) {
  switch (columnKey) {
    case "id":        return t.id_sisr;
    case "respuesta":
      return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.25, width: "fit-content" }}>
          <Chip
            label={t.estado_paciente ?? "-"}
            color={estadoRespChipColor(t) as any}
            variant="outlined"
            sx={{
              height: 20,
              "& .MuiChip-label": {
                px: 0.75,
              },
            }}
          />
          {t.fecha_estado_paciente ? <DateTimeStack value={t.fecha_estado_paciente} /> : null}
        </Box>
      );
    case "dni":           return t.paciente_dni;
    case "nombre":        return t.paciente_nombre;
    case "apellido":      return t.paciente_apellido;
    case "efector":       return t.efector;
    case "servicio":      return t.servicio;
    case "especialidad":  return t.especialidad;
    case "prof_nombre":   return t.profesional_nombre;
    case "prof_apellido": return t.profesional_apellido;
    case "estado":
      return (
        <Chip
          size="small"
          label={t.estado}
          color={estadoChipColor(t) as any}
          variant="outlined"
          sx={{
              height: 20,
              "& .MuiChip-label": {
                px: 0.75,
              },
            }}
        />
      );
    case "fecha":          return <DateStack value={t.fecha} />;
    case "hora":           return t.hora ?? "—";
    case "asignacion":     return mensajeChip(t.mensaje_asociado.ASIGNACION);
    case "cancelacion":    return mensajeChip(t.mensaje_asociado.CANCELACION);
    case "reprogramacion": return mensajeChip(t.mensaje_asociado.REPROGRAMACION);
    case "recordatorio":   return mensajeChip(t.mensaje_asociado.RECORDATORIO);
    default:               return "—";
  }
}