import React from 'react';
import {
  Box, Button, Paper, Typography,
  CircularProgress, Tooltip, IconButton, Chip,
} from '@mui/material';
import SearchIcon      from '@mui/icons-material/Search';
import ClearIcon       from '@mui/icons-material/Clear';
import DownloadIcon    from '@mui/icons-material/Download';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';

import LookPaciente   from '../../features/persona/components/LookPaciente/LookPaciente';
import { TableComponent } from '../../common/components/TableComponent';
import type { TurnoEspera } from '../../features/turno_espera/types';

import { useEsperaHistorico }                from './useEsperaHistorico';
import { ALL_COLUMNS, safeFormat, estadoColor } from './utilsEsperaHistorico';

// ---------------------- Render de celda ----------------------
function renderCell(columnKey: string, t: TurnoEspera): React.ReactNode {
  switch (columnKey) {
    case 'fecha_hora_creacion': return safeFormat(t.fecha_hora_creacion);
    case 'fecha_hora_cierre':   return safeFormat(t.fecha_hora_cierre);
    case 'estado':
      return t.estado?.significado ? (
        <Tooltip title={t.estado.significado}>
          <Chip
            label={t.estado.significado}
            size="small"
            variant="outlined"
            color={estadoColor(t.estado.significado)}
          />
        </Tooltip>
      ) : '—';
    case 'profesional': return t.profesional_solicitante?.apellido ?? '—';
    case 'efector':     return t.efector?.nombre      ?? '—';
    case 'servicio':    return t.servicio?.nombre     ?? '—';
    case 'especialidad':return t.especialidad?.nombre ?? '—';
    case 'prioridad':   return t.prioridad            ?? '—';
    default:            return '—';
  }
}

// ---------------------- Componente ----------------------
export default function EsperaHistorico(): React.ReactElement {
  const {
    paciente, setPaciente,
    finishPaciente, setFinishPaciente,
    displayedRows, loading, error,
    sortDesc, toggleSort,
    handleClear, handleDeselect, handleFetch, handleDownloadCSV,
  } = useEsperaHistorico();

  const canDownload = !loading && displayedRows.length > 0;

  return (
    <Box sx={{ p: 3 }}>

      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h5" fontWeight={700}>Turnos en Espera</Typography>

        <Box display="flex" gap={1} alignItems="center">

          <Tooltip title="Descargar CSV">
            <span>
              <IconButton onClick={handleDownloadCSV} disabled={!canDownload}>
                <DownloadIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>

      {/* Buscador / resumen de paciente */}
      <Paper sx={{ p: 2, mb: 2 }}>
        {!finishPaciente ? (
          <LookPaciente
            paciente={paciente}
            setPaciente={setPaciente}
            setFinishPaciente={setFinishPaciente}
          />
        ) : (
          <Box display="flex" alignItems="center" justifyContent="space-between" gap={2}>
            <Box>
              <Typography variant="subtitle2">Paciente seleccionado</Typography>
              <Box display="flex" alignItems="center" gap={1} mt={1}>
                <Chip label={`${paciente?.apellido ?? ''}, ${paciente?.nombre ?? ''}`} />
                <Typography variant="body2" color="text.secondary">
                  DNI: {paciente?.nro_doc ?? '—'}
                </Typography>
              </Box>
            </Box>

            <Box display="flex" gap={1} alignItems="center">
              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={handleDeselect}
                disabled={loading}
              >
                Deseleccionar
              </Button>

              <Button
                variant="contained"
                startIcon={loading ? <CircularProgress size={18} /> : <SearchIcon />}
                onClick={handleFetch}
                disabled={loading || !paciente?.id}
              >
                {loading ? 'Cargando...' : 'Cargar turnos del paciente'}
              </Button>
            </Box>
          </Box>
        )}

        {/* Barra inferior: limpiar + ordenar */}
        <Box display="flex" gap={1} mt={2} alignItems="center">
          <Button
            variant="outlined"
            startIcon={<ClearIcon />}
            onClick={handleClear}
            disabled={loading}
          >
            Limpiar
          </Button>

          <Box flexGrow={1} />

          <Typography variant="body2">Ordenar por creación</Typography>
          <IconButton onClick={toggleSort} size="small" aria-label="toggle sort">
            {sortDesc
              ? <ArrowDownwardIcon fontSize="small" />
              : <ArrowUpwardIcon   fontSize="small" />}
          </IconButton>
        </Box>

        {error && <Typography color="error" mt={1}>{error}</Typography>}
      </Paper>

      {/* Tabla */}
      <TableComponent
        columns={ALL_COLUMNS}
        visibleColumns={ALL_COLUMNS.map(c => c.key)}
        data={displayedRows}
        loading={loading}
        renderCell={renderCell}
      />

      {/* Footer */}
      <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="body2">
          Mostrando {displayedRows.length} registros.
        </Typography>
        <Button
          onClick={handleDownloadCSV}
          disabled={!canDownload}
          startIcon={<DownloadIcon />}
        >
          Descargar CSV
        </Button>
      </Box>
    </Box>
  );
}