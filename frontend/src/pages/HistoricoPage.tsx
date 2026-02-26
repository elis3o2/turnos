import React, { useState, useMemo } from 'react';
import {
  Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Typography, Tooltip, IconButton, Chip, Popover, FormGroup, FormControlLabel, Checkbox, Skeleton, MenuItem
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import DownloadIcon from '@mui/icons-material/Download';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import { AnimatePresence, motion } from 'framer-motion';
import { getHistoricoTurno } from '../features/turno/api'; // adapta si tu ruta es distinta
import type { Paciente } from '../features/persona/types';
import LookPaciente from '../features/turno/components/LookPaciente';
import { useEffect } from 'react';
// ---------------------- Tipos ----------------------
export type HistoricoItem = {
  idturno?: number | string;
  fecha_hora_mdf?: string | null; // ISO string recomendado
  estado?: string | null;
  paciente_nombre?: string | null;
  paciente_apellido?: string | null;
  nro_doc?: string | number | null;
  nombre_profesional?: string | null;
  apellido_profesional?: string | null;
  fecha?: string | null;
  hora?: string | null;
  efector?: string | null;
  servicio?: string | null;
  especialidad?: string | null;
  [k: string]: any;
};

// ---------------------- Columnas ----------------------
const ALL_COLUMNS = [
  { key: 'fecha_hora_mdf', label: 'Última modificación' },
  { key: 'estado', label: 'Estado' },
  { key: 'nro_doc', label: 'DNI' },
  { key: 'paciente_nombre', label: 'Nombre' },
  { key: 'paciente_apellido', label: 'Apellido' },
  { key: 'efector', label: 'Efector' },
  { key: 'servicio', label: 'Servicio' },
  { key: 'especialidad', label: 'Especialidad' },
  { key: 'nombre_profesional', label: 'Nombre profesional' },
  { key: 'apellido_profesional', label: 'Apellido profesional' },
  { key: 'fecha', label: 'Fecha' },
  { key: 'hora', label: 'Hora' },
] as const;

// ---------------------- Helpers ----------------------
// ---------------------- Helpers (reemplaza safeFormat por lo siguiente) ----------------------
const formatDateTime = (iso: string | null | undefined) => {
  if (!iso) return '—';
  try {
    const d = typeof iso === 'string' ? new Date(iso) : (iso as unknown as Date);
    return isNaN(d.getTime()) ? String(iso) : d.toLocaleString();
  } catch {
    return String(iso);
  }
};

const formatDateOnly = (value: string | Date | null | undefined) => {
  console.log(value)
  if (!value) return '—';
  try {
    const d = typeof value === 'string' ? new Date(value) : (value as unknown as Date);
    if (!isNaN(d.getTime())) return d.toLocaleDateString();
    if (typeof value === 'string' && value.includes(',')) return value.split(',')[0].trim();
    if (typeof value === 'string') {
      const m = value.match(/(\d{1,2}\/\d{1,2}\/\d{4})/);
      if (m) return m[1];
    }
    return String(value);
  } catch {
    return String(value);
  }
};



const downloadCSV = (rows: HistoricoItem[], visibleKeys: string[], columnsMap: Record<string, string>) => {
  const headers = visibleKeys.map(k => `"${columnsMap[k] ?? k}"`);
  const csvRows = [headers.join(',')];

  for (const r of rows) {
    const row = visibleKeys.map(k => {
      let val: any = (r as any)[k];
      if (k === 'fecha_hora_mdf') val = formatDateTime(val);
      if (k === 'fecha') val = formatDateOnly(val);
      if (val === null || val === undefined) val = '';
      return `"${String(val).replace(/"/g, '""')}"`;
    });
    csvRows.push(row.join(','));
  }

  const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `historico_turnos_${new Date().toISOString()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

const estadoColor = (estado?: string | null) => {
  if (!estado) return 'default';
  const e = String(estado).trim().toUpperCase();
  switch (e) {
    case 'LIBRE': return 'success';
    case 'SUSPENDIDO': return 'warning';
    case 'ASIGNADO': return 'info';
    case 'ATENDIDO': return 'success';
    case 'AUSENTE': return 'error';
    case 'RECEPCIONADO': return 'info';
    case 'ELIMINADO': return 'error';
    case 'REPROGRAMADO': return 'warning';
    default: {
      const el = e.toLowerCase();
      if (el.includes('cancel')) return 'error';
      if (el.includes('conf') || el.includes('confirm')) return 'success';
      if (el.includes('pend') || el.includes('espera') || el.includes('pending')) return 'warning';
      return 'default';
    }
  }
};

// ---------------------- Componente ----------------------
export default function HistoricoPage(): React.ReactElement {


  const [rows, setRows] = useState<HistoricoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [finishPaciente, setFinishPaciente] = useState<boolean>(false);

  // nuevo estado: efector seleccionado ('ALL' = todos)
  const [selectedEfector, setSelectedEfector] = useState<string>('ALL');

  // columnas visibles (comportamiento original: todas visibles por defecto)
  const initialVisibility = useMemo(() => {
    const map: Record<string, boolean> = {};
    ALL_COLUMNS.forEach(c => (map[c.key] = true));
    return map;
  }, []);
  const [visibleCols, setVisibleCols] = useState<Record<string, boolean>>(initialVisibility);

  // popover / menu de columnas
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openColsMenu = Boolean(anchorEl);
  const handleOpenColsMenu = (e: React.MouseEvent<HTMLElement>) => setAnchorEl(e.currentTarget);
  const handleCloseColsMenu = () => setAnchorEl(null);

  // orden cliente por fecha_hora_mdf
  const [sortDesc, setSortDesc] = useState<boolean>(true);
  const toggleSort = () => setSortDesc(prev => !prev);

  // ---------------------- Acciones (DNI) ----------------------


  const toggleColumn = (key: string) => {
    setVisibleCols(prev => ({ ...prev, [key]: !prev[key] }));
  };
  const showAll = () => {
    const next: Record<string, boolean> = {};
    ALL_COLUMNS.forEach(c => (next[c.key] = true));
    setVisibleCols(next);
  };
  const hideAll = () => {
    const next: Record<string, boolean> = {};
    ALL_COLUMNS.forEach(c => (next[c.key] = false));
    setVisibleCols(next);
  };

  // ordenar rows cliente por fecha_hora_mdf localmente si existe
  const displayedRows = useMemo(() => {
    const copy = [...rows];
    copy.sort((a, b) => {
      const da = a.fecha_hora_mdf ? new Date(a.fecha_hora_mdf).getTime() : 0;
      const db = b.fecha_hora_mdf ? new Date(b.fecha_hora_mdf).getTime() : 0;
      return sortDesc ? db - da : da - db;
    });
    return copy;
  }, [rows, sortDesc]);

  // lista única de efectores disponible (para el select)
  const efectores = useMemo(() => {
    const s = new Set<string>();
    for (const r of rows) {
      if (r.efector) s.add(String(r.efector));
    }
    return Array.from(s).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  // aplicar filtro por efector sobre displayedRows
  const filteredRows = useMemo(() => {
    if (!selectedEfector || selectedEfector === 'ALL') return displayedRows;
    return displayedRows.filter(r => (r.efector ?? '') === selectedEfector);
  }, [displayedRows, selectedEfector]);

  // keys visibles
  const visibleKeys = useMemo(() => ALL_COLUMNS.filter(c => visibleCols[c.key]).map(c => c.key), [visibleCols]);

  const columnsMap = useMemo(() => {
    const m: Record<string, string> = {};
    ALL_COLUMNS.forEach(c => (m[c.key] = c.label));
    return m;
  }, []);


  const handleDeselect = () => {
    setPaciente(null);
    setFinishPaciente(false);
    setRows([]);
    setError(null);
    setSelectedEfector('ALL');
  };


  // ancho mínimo dinámico para forzar scroll horizontal cuando haya muchas columnas
  const tableMinWidth = useMemo(() => Math.max(visibleKeys.length * 120, 600), [visibleKeys]);

  const fetchHistoricoByPacienteId = async (pacienteId: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getHistoricoTurno(pacienteId);
      setRows(Array.isArray(data) ? data : []);
      // resetear filtro si no hay efectores
      setSelectedEfector('ALL');
    } catch (e: any) {
      setError(e?.message ?? 'Error al consultar el histórico');
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (finishPaciente && paciente?.id) {
      fetchHistoricoByPacienteId(paciente.id);
    }
  }, [finishPaciente, paciente?.id]);

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Box>
          <Typography variant="h5" fontWeight={700}>Histórico de Turnos por paciente</Typography>
        </Box>

        <Box display="flex" gap={1} alignItems="center">
          <Tooltip title="Columnas">
            <IconButton onClick={handleOpenColsMenu}><ViewColumnIcon /></IconButton>
          </Tooltip>

          <Tooltip title="Descargar CSV">
            <span>
              <IconButton
                onClick={() => downloadCSV(filteredRows, visibleKeys, columnsMap)}
                disabled={loading || filteredRows.length === 0}
              >
                <DownloadIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>

      {/* Buscador / LookPaciente */}
      {!finishPaciente ? (
        <LookPaciente
          paciente={paciente}
          setPaciente={setPaciente}
          setFinishPaciente={setFinishPaciente}
        />
      ) : (
        <Paper sx={{ p: 2, mb: 2 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between" gap={2} flexWrap="wrap">
            <Box>
              <Typography variant="subtitle2">Paciente seleccionado</Typography>
              <Box display="flex" alignItems="center" gap={1} mt={1}>
                <Chip label={`${paciente?.apellido ?? ''}, ${paciente?.nombre ?? ''}`} />
                <Typography variant="body2" color="text.secondary">DNI: {paciente?.nro_doc ?? '—'}</Typography>
              </Box>
            </Box>

            <Box display="flex" gap={1} alignItems="center">
              <TextField
                select
                label="Efector"
                value={selectedEfector}
                onChange={(e) => setSelectedEfector(e.target.value)}
                size="small"
                sx={{ minWidth: 220 }}
              >
                <MenuItem value="ALL">Todos</MenuItem>
                {efectores.map(e => <MenuItem key={e} value={e}>{e}</MenuItem>)}
              </TextField>

              <Button variant="outlined" startIcon={<ClearIcon />} onClick={handleDeselect} disabled={loading}>
                Deseleccionar
              </Button>

            </Box>
          </Box>

          {error && (
            <Typography color="error" mt={1}>{error}</Typography>
          )}
        </Paper>
      )}

      {/* Popover columnas (más visual y con checkboxes) */}
      <Popover
        open={openColsMenu}
        anchorEl={anchorEl}
        onClose={handleCloseColsMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Box sx={{ p: 2, minWidth: 260 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="subtitle2">Columnas</Typography>
            <Box>
              <Button size="small" onClick={() => { showAll(); handleCloseColsMenu(); }} sx={{ mr: 1 }}>Mostrar todo</Button>
              <Button size="small" onClick={() => { hideAll(); handleCloseColsMenu(); }}>Ocultar todo</Button>
            </Box>
          </Box>

          <FormGroup>
            {ALL_COLUMNS.map(col => (
              <FormControlLabel
                key={col.key}
                control={<Checkbox checked={Boolean(visibleCols[col.key])} onChange={() => toggleColumn(col.key)} />}
                label={col.label}
              />
            ))}
          </FormGroup>
        </Box>
      </Popover>

      {/* Tabla */}
      <TableContainer component={Paper} sx={{ borderRadius: 2, overflowX: 'auto' }}>
        <Table size="small" stickyHeader sx={{ minWidth: tableMinWidth }}>
          <TableHead>
            <TableRow sx={{ background: (theme) => theme.palette.background.paper }}>
              {ALL_COLUMNS.filter(c => visibleCols[c.key]).map(col => (
                <TableCell key={col.key} sx={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140, py: 0.5, px: 1 }}>
                  <Box display="flex" alignItems="center">
                    <span>{col.label}</span>
                    {col.key === 'fecha_hora_mdf' && (
                      <IconButton size="small" onClick={toggleSort} sx={{ ml: 1 }}>
                        {sortDesc ? <ArrowDownwardIcon fontSize="small" /> : <ArrowUpwardIcon fontSize="small" />}
                      </IconButton>
                    )}
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading && (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={`sk-${i}`}>
                  {ALL_COLUMNS.filter(c => visibleCols[c.key]).map((_, j) => (
                    <TableCell key={j}><Skeleton variant="text" /></TableCell>
                  ))}
                </TableRow>
              ))
            )}

            {!loading && filteredRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={Math.max(1, visibleKeys.length)}>
                  <Box p={2}><Typography variant="body2">No se encontraron registros para los filtros seleccionados.</Typography></Box>
                </TableCell>
              </TableRow>
            )}

            <AnimatePresence initial={false} mode="popLayout">
              {!loading && filteredRows.map((r, idx) => {
                const rowKey = r.idturno ? `turno-${String(r.idturno)}-${r.fecha_hora_mdf ?? ''}` : `idx-${idx}`;
                return (
                  <TableRow
                    component={motion.tr}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.18 }}
                    key={rowKey}
                    sx={{ '&:hover': { boxShadow: 3 } }}
                  >
                    {ALL_COLUMNS.filter(c => visibleCols[c.key]).map(col => {
                      switch (col.key) {
                        case 'fecha_hora_mdf': return <TableCell key={col.key} sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140, py: 0.5, px: 1 }}>{formatDateTime(r.fecha_hora_mdf)}</TableCell>;
                        case 'estado':
                          return (
                            <TableCell key={col.key} sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140, py: 0.5, px: 1 }}>
                              {r.estado ? (
                                <Tooltip title={String(r.estado)}>
                                  <Chip
                                    label={String(r.estado)}
                                    size="small"
                                    variant="outlined"
                                    color={estadoColor(r.estado) as any}
                                  />
                                </Tooltip>
                              ) : '—'}
                            </TableCell>
                          );
                        case 'nro_doc': return <TableCell key={col.key} sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140, py: 0.5, px: 1 }}>{r.nro_doc ?? '—'}</TableCell>;
                        case 'paciente_nombre': return <TableCell key={col.key} sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140, py: 0.5, px: 1 }}>{r.paciente_nombre ?? '—'}</TableCell>;
                        case 'paciente_apellido': return <TableCell key={col.key} sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140, py: 0.5, px: 1 }}>{r.paciente_apellido ?? '—'}</TableCell>;
                        case 'efector': return <TableCell key={col.key} sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140, py: 0.5, px: 1 }}>{r.efector ?? '—'}</TableCell>;
                        case 'servicio': return <TableCell key={col.key} sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140, py: 0.5, px: 1 }}>{r.servicio ?? '—'}</TableCell>;
                        case 'especialidad': return <TableCell key={col.key} sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140, py: 0.5, px: 1 }}>{r.especialidad ?? '—'}</TableCell>;
                        case 'nombre_profesional': return <TableCell key={col.key} sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140, py: 0.5, px: 1 }}>{r.nombre_profesional ?? '—'}</TableCell>;
                        case 'apellido_profesional': return <TableCell key={col.key} sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140, py: 0.5, px: 1 }}>{r.apellido_profesional ?? '—'}</TableCell>;
                        case 'fecha': return <TableCell key={col.key} sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140, py: 0.5, px: 1 }}>{formatDateOnly(r.fecha)}</TableCell>;
                        case 'hora': return <TableCell key={col.key} sx={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140, py: 0.5, px: 1 }}>{r.hora ?? '—'}</TableCell>;
                        default: return null;
                      }
                    })}
                  </TableRow>
                );
              })}
            </AnimatePresence>
          </TableBody>
        </Table>
      </TableContainer>

      <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="body2">Mostrando {filteredRows.length} registros.</Typography>
        <Box>
          <Button onClick={() => downloadCSV(filteredRows, visibleKeys, columnsMap)} disabled={filteredRows.length === 0} startIcon={<DownloadIcon />}>
            Descargar CSV
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
