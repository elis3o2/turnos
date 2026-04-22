import React, { useState } from 'react';
import {
  Box, Button, Paper, Chip,
  TextField, Typography, MenuItem, IconButton
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import ViewColumnIcon from '@mui/icons-material/ViewColumn';
import LookPaciente from '../../features/persona/components/LookPaciente/LookPaciente';
import { ColumnSelector } from '../../common/components/ColumnSelector';
import { TableComponent } from '../../common/components/TableComponent';
import { useHistorico } from './useHistorico';
import { renderCell, ALL_COLUMNS, DEFAULT_VISIBLE_COLUMNS } from './utilsHistorico';

export default function HistoricoPage(): React.ReactElement {
  const {
    loading,
    error,
    paciente,
    setPaciente,
    finishPaciente,
    setFinishPaciente,
    selectedEfector,
    setSelectedEfector,
    efectores,
    filteredTurnos,
    handleDeselect,
  } = useHistorico();

  const [visibleColumns, setVisibleColumns] = useState<string[]>(DEFAULT_VISIBLE_COLUMNS);
  const [anchorCols, setAnchorCols] = useState<null | HTMLElement>(null);

  return (
    <Box sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="h5" fontWeight={700}>
          Histórico de Turnos por paciente
        </Typography>
      </Box>

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
                <Typography variant="body2" color="text.secondary">
                  DNI: {paciente?.nro_doc ?? '—'}
                </Typography>
              </Box>
            </Box>

            <Box display="flex" gap={1} alignItems="center">
              <IconButton
                onClick={(e) => setAnchorCols(e.currentTarget)}
                size="small"
                title="Columnas"
              >
                <ViewColumnIcon fontSize="medium" />
              </IconButton>

              <ColumnSelector
                columns={ALL_COLUMNS}
                value={visibleColumns}
                onChange={setVisibleColumns}
                anchorEl={anchorCols}
                onClose={() => setAnchorCols(null)}
              />

              <TextField
                select
                label="Efector"
                value={selectedEfector}
                onChange={(e) => setSelectedEfector(e.target.value)}
                size="small"
                sx={{ minWidth: 220 }}
              >
                <MenuItem value="ALL">Todos</MenuItem>
                {efectores.map(e => (
                  <MenuItem key={e} value={e}>{e}</MenuItem>
                ))}
              </TextField>

              <Button
                variant="outlined"
                startIcon={<ClearIcon />}
                onClick={handleDeselect}
                disabled={loading}
              >
                Deseleccionar
              </Button>
            </Box>
          </Box>

          {error && (
            <Typography color="error" mt={1}>{error}</Typography>
          )}
        </Paper>
      )}

      <TableComponent
        columns={ALL_COLUMNS}
        visibleColumns={visibleColumns}
        data={filteredTurnos}
        loading={loading}
        renderCell={renderCell}
      />
    </Box>
  );
}