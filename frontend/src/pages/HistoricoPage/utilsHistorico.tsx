import { Chip } from '@mui/material';
import type { TurnoHistorico } from '../../features/informix/types';
import { DateStack } from '../../common/components/DateStack';
import { DateTimeStack } from '../../common/components/DateTimeStack';

type ChipColor = 'success' | 'error' | 'warning' | 'info' | 'default';

const ESTADO_COLOR_MAP: Record<string, ChipColor> = {
  LIBRE:        'error',
  SUSPENDIDO:   'error',
  ASIGNADO:     'success',
  ATENDIDO:     'success',
  AUSENTE:      'error',
  RECEPCIONADO: 'info',
  ELIMINADO:    'error',
  REPROGRAMADO: 'warning',
};

export function estadoChipColor(t: TurnoHistorico): ChipColor {
  return ESTADO_COLOR_MAP[t.estado ?? ''] ?? 'default';
}

export function renderCell(columnKey: string, t: TurnoHistorico) {
  switch (columnKey) {
    case 'fecha_hora_mdf':  return <DateTimeStack value={t.fecha_hora_mdf} />;
    case 'estado':          return <Chip size="small" label={t.estado} color={estadoChipColor(t)} variant="outlined" />;
    case 'efector':         return t.efector;
    case 'servicio':        return t.servicio;
    case 'especialidad':    return t.especialidad;
    case 'prof_nombre':     return t.profesional_nombre;
    case 'prof_apellido':   return t.profesional_apellido;
    case 'fecha':           return <DateStack value={t.fecha} />;
    case 'hora':            return t.hora;
    default:                return null;
  }
}

export const ALL_COLUMNS = [
  { key: 'fecha_hora_mdf', label: 'Última modificación' },
  { key: 'estado',         label: 'Estado' },
  { key: 'efector',        label: 'Efector' },
  { key: 'servicio',       label: 'Servicio' },
  { key: 'especialidad',   label: 'Especialidad' },
  { key: 'prof_nombre',    label: 'Nombre profesional' },
  { key: 'prof_apellido',  label: 'Apellido profesional' },
  { key: 'fecha',          label: 'Fecha' },
  { key: 'hora',           label: 'Hora' },
] as const;

export const DEFAULT_VISIBLE_COLUMNS: string[] = [
  'fecha_hora_mdf', 'efector', 'servicio', 'especialidad', 'estado', 'fecha', 'hora',
];