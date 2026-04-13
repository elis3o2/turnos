import React, { useState, useMemo } from 'react';
import {
  Box, Button, Paper, Chip,
  TextField, Typography, MenuItem, IconButton
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import { getHistoricoTurno } from '../features/informix/api'
import type { Paciente } from '../features/persona/types';
import LookPaciente from '../features/turno_espera/components/LookPaciente';
import { useEffect } from 'react';
import type { TurnoHistorico } from '../features/informix/types';
import { DateStack } from '../common/components/DateStack';
import { DateTimeStack } from '../common/components/DateTimeStack';
import { ColumnSelector } from '../common/components/ColumnSelector';
import { TableComponent } from '../common/components/TableComponent';
import ViewColumnIcon from "@mui/icons-material/ViewColumn";




function estadoChipColor(t: TurnoHistorico) {
  const map: Record<string, "success" | "error" | "warning" | "info"> = {
    "LIBRE": "error",
    "SUSPENDIDO": "error",
    "ASIGNADO": "success",
    "ATENDIDO": "success",
    "AUSENTE": "error",
    "RECEPCIONADO": "info",
    "ELIMINADO": "error",
    "REPROGRAMADO": "warning",
  };
  return map[t.estado ?? ""] ?? "default";
}



 function renderCell(columnKey: string, t: TurnoHistorico): React.ReactNode {
    switch (columnKey) {
      case "fecha_hora_mdf":           return <DateTimeStack value={t.fecha_hora_mdf} />
      case "estado":
        return (
            <Chip
              size="small"
              label={t.estado}
              color={estadoChipColor(t) as any}
              variant="outlined"
            />
        );
      case "nro_doc":       return t.nro_doc;
      case "nombre":        return t.paciente_nombre;
      case "apellido":      return t.paciente_apellido;
      case "efector":       return t.efector;
      case "servicio":      return t.servicio;
      case "especialidad":  return t.especialidad;
      case "prof_nombre":   return t.profesional_nombre;
      case "prof_apellido": return t.profesional_apellido;
      case "fecha":          return <DateStack value={t.fecha} />;
      case "hora":           return t.hora;
    }
  }


// ---------------------- Componente ----------------------
export default function HistoricoPage(): React.ReactElement {


  const [turnos, setTurnos] = useState<TurnoHistorico[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const efectores = useMemo(
    () => [...new Set(turnos.map(t => t.efector).filter(Boolean))],
    [turnos]
  );
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [finishPaciente, setFinishPaciente] = useState<boolean>(false);

  // nuevo estado: efector seleccionado ('ALL' = todos)
  const [selectedEfector, setSelectedEfector] = useState<string>('ALL');
  const [anchorCols, setAnchorCols] = useState<null | HTMLElement>(null);


  const allColumns = useMemo(
    () => [
  { key: 'fecha_hora_mdf', label: 'Última modificación' },
  { key: 'estado', label: 'Estado' },
  { key: 'nro_doc', label: 'DNI' },
  { key: 'nombre', label: 'Nombre' },
  { key: 'apellido', label: 'Apellido' },
  { key: 'efector', label: 'Efector' },
  { key: 'servicio', label: 'Servicio' },
  { key: 'especialidad', label: 'Especialidad' },
  { key: 'prof_nombre', label: 'Nombre profesional' },
  { key: 'prof_apellido', label: 'Apellido profesional' },
  { key: 'fecha', label: 'Fecha' },
  { key: 'hora', label: 'Hora' },
    ],
    []
  );

  const filteredTurnos = useMemo(
    () =>
      selectedEfector === 'ALL'
        ? turnos
        : turnos.filter(t => t.efector === selectedEfector),
    [turnos, selectedEfector]
  );    

  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    "fecha_hora_mdf", "efector", "servicio", "especialidad", "estado",
     "fecha", "hora",
  ]);

  //---------------------- Acciones (DNI) ----------------------

  const handleDeselect = () => {
    setPaciente(null);
    setFinishPaciente(false);
    setTurnos([]);
    setError(null);
    setSelectedEfector('ALL');
  };



  const fetchHistoricoByPacienteId = async (pacienteId: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getHistoricoTurno(pacienteId);
      setTurnos(Array.isArray(data) ? data : []);
      // resetear filtro si no hay efectores
      setSelectedEfector('ALL');
    } catch (e: any) {
      setError(e?.message ?? 'Error al consultar el histórico');
      setTurnos([]);
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

            <IconButton
                  onClick={(e) => setAnchorCols(e.currentTarget)}
                  size="small"
                  title="Columnas"
                >
                  <ViewColumnIcon fontSize="medium" />
            </IconButton>
              <Box display="flex" gap={1} alignItems="center">
                <ColumnSelector
                    columns={allColumns}
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
                {efectores.map(e => <MenuItem key={e} value={e}>{e}</MenuItem>)}
              </TextField>

              <Button variant="outlined" startIcon={<ClearIcon />} onClick={handleDeselect} disabled={loading}>
                Deseleccionar
              </Button>

            </Box>
          </Box>

 
          </Box>

          {error && (
            <Typography color="error" mt={1}>{error}</Typography>
          )}
        </Paper>
      )}



      {/* Tabla */}
      <TableComponent
        columns={allColumns}
        visibleColumns={visibleColumns}
        data={filteredTurnos}
        loading={loading}
        renderCell={renderCell}
      />

    </Box>
  );
}
