import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Paper,
  RadioGroup,
  Radio,
  FormControlLabel,
  List,
  ListItem,
  ListItemText,
  Alert,
  Stack,
} from "@mui/material";
import type { Profesional } from "../../types";
import { useLookProfesional } from "./useLookProfesional";
import { getProfesionalDisplayName } from "./utilsLookProfesional";

interface Props {
  efectorId: number;
  selectedProfesional: Profesional | null;
  setProfesional: (p: Profesional | null) => void;
  setFinishProfesional: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function LookProfesional({
  efectorId,
  selectedProfesional,
  setProfesional,
  setFinishProfesional,
}: Props) {
  const {
    nombre,
    setNombre,
    apellido,
    setApellido,
    profesionales,
    selectedProfesionalId,
    loading,
    error,
    profesionalSeleccionado,
    handleBuscar,
    handleRadioChange,
    handleConfirm,
    handleClear,
  } = useLookProfesional({
    efectorId,
    selectedProfesional,
    setProfesional,
    setFinishProfesional,
  });

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", p: 1 }}>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Buscar profesional que deriva
      </Typography>

      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <TextField
          label="Nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          size="small"
          fullWidth
        />
        <TextField
          label="Apellido"
          value={apellido}
          onChange={(e) => setApellido(e.target.value)}
          size="small"
          fullWidth
        />
      </Box>

      <Button
        variant="contained"
        onClick={handleBuscar}
        disabled={loading || !efectorId}
        sx={{ mb: 2 }}
      >
        {loading ? <CircularProgress size={20} color="inherit" /> : "Buscar"}
      </Button>

      {error && (
        <Box sx={{ mb: 2 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}

      {!loading && profesionales.length > 0 && (
        <Paper variant="outlined" sx={{ p: 1, mb: 2 }}>
          <RadioGroup
            value={selectedProfesionalId}
            onChange={(e) => handleRadioChange(e.target.value)}
          >
            <List disablePadding>
              {profesionales.map((p) => (
                <ListItem
                  key={p.id}
                  secondaryAction={
                    <FormControlLabel
                      value={String(p.id)}
                      control={<Radio />}
                      label=""
                    />
                  }
                  sx={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
                >
                  <ListItemText primary={getProfesionalDisplayName(p)} />
                </ListItem>
              ))}
            </List>
          </RadioGroup>
        </Paper>
      )}

      {profesionalSeleccionado && (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="h6">
            Seleccionado: {getProfesionalDisplayName(profesionalSeleccionado)}
          </Typography>

          <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
            <Button
              variant="contained"
              onClick={handleConfirm}
              disabled={!profesionalSeleccionado}
            >
              Confirmar
            </Button>

            <Button variant="outlined" onClick={handleClear}>
              Limpiar
            </Button>
          </Stack>
        </Paper>
      )}
    </Box>
  );
}