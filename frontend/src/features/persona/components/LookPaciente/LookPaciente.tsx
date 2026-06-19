import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  RadioGroup,
  FormControlLabel,
  Radio,
  Paper,
  List,
  ListItem,
  ListItemText,
  Alert,
  Stack,
} from "@mui/material";
import type { Paciente } from "../../types";
import { useLookPaciente } from "./useLookPaciente";
import { formatPacienteNombre, telefonoCompleto, formatPacienteDireccion, getPhoneAlert } from "../../utils";
import type { Setter } from "@/common/types";

interface Props {
  paciente: Paciente | null;
  setPaciente: Setter<Paciente | null>;
  setFinishPaciente: Setter<boolean>;
}

function LookPaciente({ paciente, setPaciente, setFinishPaciente }: Props) {
  const {
    dni,
    setDni,
    loading,
    error,
    pacientes,
    selectedPacienteId,
    handleBuscar,
    handleSelectPaciente,
    pacienteSeleccionado,
    handleConfirmar,
    handleLimpiar,
  } = useLookPaciente({ paciente, setPaciente, setFinishPaciente });

  const phoneAlert = getPhoneAlert(pacienteSeleccionado);
  const pac = pacienteSeleccionado
  return (
    <Box sx={{ maxWidth: 900, mx: "auto", p: 2 }}>
      <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}>
        <TextField
          label="DNI"
          value={dni}
          onChange={(e) => setDni(e.target.value)}
          variant="outlined"
          size="small"
          sx={{ flex: 1 }}
        />
        <Button variant="contained" onClick={handleBuscar} disabled={loading}>
          {loading ? <CircularProgress size={20} color="inherit" /> : "Buscar"}
        </Button>
      </Box>

      <Box sx={{ mb: 2 }}>
        {error && <Alert severity="error">{error}</Alert>}
      </Box>

      <Box sx={{ mb: 2 }}>
        {loading && (
          <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
            <CircularProgress />
          </Box>
        )}

        {!loading && pacientes.length === 0 && !error && (
          <Typography variant="body2" color="text.secondary">
            Ingresá DNI y presioná Buscar para ver los pacientes.
          </Typography>
        )}

        {!loading && pacientes.length > 0 && (
          <Paper variant="outlined" sx={{ p: 1 }}>
            <RadioGroup
              value={String(selectedPacienteId ?? "")}
              onChange={(e) => handleSelectPaciente(e.target.value)}
            >
              <List disablePadding>
                {pacientes.map((p) => (
                  <ListItem
                    key={p.id}
                    alignItems="flex-start"
                    secondaryAction={
                      <FormControlLabel
                        value={String(p.id)}
                        control={<Radio />}
                        label=""
                        sx={{ mr: 0 }}
                      />
                    }
                    sx={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
                  >
                    <ListItemText
                      disableTypography
                      primary={
                        <Box
                          sx={{
                            display: "flex",
                            gap: 1,
                            alignItems: "baseline",
                            flexWrap: "wrap",
                          }}
                        >
                          <Typography variant="subtitle2">
                            {formatPacienteNombre(p)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            · DNI: {p?.nro_doc ?? "-"}
                          </Typography>
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2">
                            Sexo: {p?.sexo ?? "-"}
                          </Typography>
                          <Typography variant="body2">
                            Fecha Nacimiento: {p?.fecha_nacimiento ? String(p.fecha_nacimiento) : "-"}
                          </Typography>
                          <Typography variant="body2">
                            Calle: {p.nombre_calle ?? "-"} · Altura: {p.numero_calle ?? "-"}
                          </Typography>
                          <Typography variant="body2">
                            Teléfono: {telefonoCompleto(p.carac_telef, p.nro_telef)}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </RadioGroup>
          </Paper>
        )}
      </Box>

      <Box sx={{ mt: 2 }}>
        {pac ? (
          <Paper variant="outlined" sx={{ p: 2 }}>
            <Box sx={{ mb: 2 }}>
              {phoneAlert && (
                <Alert severity={phoneAlert.severity}>{phoneAlert.message}</Alert>
              )}
            </Box>

            <Typography variant="h6">
              Seleccionado: {formatPacienteNombre(pac)}
            </Typography>
            <Typography variant="body2">
              DNI: {pac?.nro_doc ?? "-"}
            </Typography>
            <Typography variant="body2">
              Sexo: {pac.sexo ?? "-"}
            </Typography>
            <Typography variant="body2">
              Fecha Nacimiento: {pac.fecha_nacimiento ? String(pac.fecha_nacimiento) : "-"}
            </Typography>
            <Typography variant="body2">
              Dirección: {formatPacienteDireccion(pacienteSeleccionado)}
            </Typography>

            <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
              <Button variant="contained" onClick={handleConfirmar}>
                Confirmar
              </Button>

              <Button variant="outlined" onClick={handleLimpiar}>
                Limpiar
              </Button>
            </Stack>
          </Paper>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No hay paciente seleccionado.
          </Typography>
        )}
      </Box>
    </Box>
  );
}

export default LookPaciente;