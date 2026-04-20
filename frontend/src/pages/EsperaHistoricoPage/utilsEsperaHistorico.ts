import type { TurnoEspera } from '../../features/turno_espera/types';

// ---------------------- Columnas ----------------------
export const ALL_COLUMNS = [
  { key: 'fecha_hora_creacion', label: 'Creación' },
  { key: 'fecha_hora_cierre',   label: 'Cierre' },
  { key: 'estado',              label: 'Estado' },
  { key: 'profesional',         label: 'Profesional' },
  { key: 'efector',             label: 'Efector' },
  { key: 'servicio',            label: 'Servicio' },
  { key: 'especialidad',        label: 'Especialidad' },
  { key: 'prioridad',           label: 'Prioridad' },
] as const;

export type ColumnKey = (typeof ALL_COLUMNS)[number]['key'];

/** Mapa key → label listo para usar sin recalcular */
export const COLUMNS_MAP: Record<string, string> = Object.fromEntries(
  ALL_COLUMNS.map(c => [c.key, c.label]),
);

// ---------------------- Helpers ----------------------

/** Formatea un ISO string a locale string; devuelve '—' si está vacío o falla. */
export const safeFormat = (iso?: string | null): string => {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return String(iso);
  }
};

/** Devuelve el color de chip MUI según el estado del turno. */
export const estadoColor = (
  estado: string,
): 'warning' | 'success' | 'default' => {
  switch (estado.trim().toUpperCase()) {
    case 'ESPERA':   return 'warning';
    case 'OTORGADO': return 'success';
    default:         return 'default';
  }
};

/** Extrae el valor de celda para una columna dada de un TurnoEspera. */
export const getCellValue = (key: string, r: TurnoEspera): string => {
  switch (key) {
    case 'fecha_hora_creacion': return safeFormat(r.fecha_hora_creacion);
    case 'fecha_hora_cierre':   return safeFormat(r.fecha_hora_cierre);
    case 'estado':              return r.estado?.significado ?? '';
    case 'nro_doc':             return r.paciente?.nro_doc ?? '';
    case 'paciente_nombre':     return r.paciente?.nombre ?? '';
    case 'paciente_apellido':   return r.paciente?.apellido ?? '';
    case 'profesional':
      return `${r.profesional_solicitante?.nombre ?? ''} ${r.profesional_solicitante?.apellido ?? ''}`.trim();
    case 'efector':             return r.efector?.nombre ?? '';
    case 'servicio':            return r.servicio?.nombre ?? '';
    case 'especialidad':        return r.especialidad?.nombre ?? '';
    case 'prioridad':           return String(r.prioridad ?? '');
    default:                    return "";
  }
};

/** Genera y dispara la descarga de un CSV con las filas y columnas visibles. */
export const downloadCSV = (
  rows: TurnoEspera[],
  visibleKeys: string[],
  columnsMap: Record<string, string> = COLUMNS_MAP,
): void => {
  const headers = visibleKeys.map(k => `"${columnsMap[k] ?? k}"`);

  const csvRows = [
    headers.join(','),
    ...rows.map(r =>
      visibleKeys
        .map(k => {
          const val = getCellValue(k, r);
          return `"${val.replace(/"/g, '""')}"`;
        })
        .join(','),
    ),
  ];

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `turnos_${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};