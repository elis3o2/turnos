import {
  Box,
  Typography,
  Paper,
  Button,
  Stack,
  CircularProgress,
  Alert,
} from "@mui/material";

import { EfectorForm } from "../EfectorForm";
import { ServicioForm } from "../ServicioForm";
import { EspecialidadForm } from "../EspecialidadForm";
import type { Efector, Servicio, Especialidad } from "../../types";
// ─── Types ────────────────────────────────────────────────────────────────────

interface Props {
  servicios: Servicio[]
  especialidades: Especialidad[]
  efectores: Efector[]
  selectedServicio: Servicio | null
  selectedEspecialidad: Especialidad | null
  selectedEfector: Efector | null
  loading: boolean
  error: string | null
  setSelectedServicio: (val: Servicio | null) => void
  setSelectedEspecialidad: (val: Especialidad | null) => void
  setSelectedEfector: (val: Efector | null) => void
  handleConfirm: () => void
  handleClear: () => void
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function LookEfeSerEsp({
  servicios,
  especialidades,
  efectores,
  selectedServicio,
  selectedEspecialidad,
  selectedEfector,
  loading,
  error,
  setSelectedServicio,
  setSelectedEspecialidad,
  setSelectedEfector,
  handleConfirm,
  handleClear,
}: Props) {


  return (
    <Box sx={{ maxWidth: 900, mx: "auto", p: 1 }}>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Seleccionar servicio / especialidad / efector
      </Typography>

      <Stack spacing={2}>
        <ServicioForm
          servicios={servicios}
          selectedServicio={selectedServicio}
          setSelectedServicio={setSelectedServicio}
        />

        {selectedServicio && especialidades.length > 0 && (
          <EspecialidadForm
            especialidades={especialidades}
            selectedEspecialidad={selectedEspecialidad}
            setSelectedEspecialidad={setSelectedEspecialidad}
          />
        )}

        {selectedEspecialidad && efectores.length > 0 && (
          <EfectorForm
            efectores={efectores}
            selectedEfector={selectedEfector}
            setSelectedEfector={setSelectedEfector}
          />
        )}
      </Stack>
      
      {selectedEfector && (
        <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
          <Typography variant="subtitle2">Efector seleccionado</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            {selectedEfector.nombre}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 1 }}>
              {error}
            </Alert>
          )}

          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              onClick={handleConfirm}
              disabled={loading || !selectedServicio || !selectedEspecialidad}
            >
              {loading ? <CircularProgress size={18} color="inherit" /> : "Confirmar"}
            </Button>
            <Button variant="outlined" onClick={handleClear} disabled={loading}>
              Limpiar
            </Button>
          </Stack>
        </Paper>
      )}

      {error && !selectedEfector && (
        <Paper variant="outlined" sx={{ p: 1, mt: 1 }}>
          <Typography color="error" variant="body2">
            {error}
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
