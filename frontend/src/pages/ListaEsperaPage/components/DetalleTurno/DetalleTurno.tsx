import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CancelIcon from "@mui/icons-material/Cancel";
import type { EstudioRequerido, TurnoEspera } from "../../../../features/turno_espera/types";
import { useDetalleTurno } from "./useDetalleTurno";

interface Props {
  activeTurno: TurnoEspera | null;
  openDialog: boolean;
  handleCloseDialog: () => void;
  selectedEstudios: number[];
  handleToggleEstudio: (e: EstudioRequerido) => void;
  handleGuardarEstudios: () => void;
  selectedDerivacion: number | null;
  handleRemove: () => void;
  isRemoving: (id?: number | null) => boolean;
}

export default function DetalleTurno({
  activeTurno,
  openDialog,
  handleCloseDialog,
  selectedEstudios,
  handleToggleEstudio,
  handleGuardarEstudios,
  selectedDerivacion,
  handleRemove,
  isRemoving,
}: Props) {
  const {
    telefonoEstado,
    telefonoTooltipText,
    telefonoTexto,
    pacienteTexto,
    pacienteSexoFechaTexto,
    medicoSolicitanteTexto,
    diasEnEspera,
    puedeEliminar,
    tienePendientes,
    deshabilitarGuardar,
    isRemovingActual,
  } = useDetalleTurno({
    activeTurno,
    selectedEstudios,
    selectedDerivacion,
    isRemoving,
  });

  const telefonoIcon =
    telefonoEstado === "valid" ? (
      <CheckCircleIcon sx={{ color: "success.main", ml: 1 }} fontSize="small" />
    ) : telefonoEstado === "missing" ? (
      <WarningAmberIcon sx={{ color: "warning.main", ml: 1 }} fontSize="small" />
    ) : (
      <CancelIcon sx={{ color: "error.main", ml: 1 }} fontSize="small" />
    );

  return (
    <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
      <DialogTitle>
        Detalle del turno
        <IconButton
          aria-label="close"
          onClick={handleCloseDialog}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        {activeTurno ? (
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {pacienteTexto}
            </Typography>

            <Typography variant="subtitle2" component="div" sx={{ fontWeight: 600 }}>
              {pacienteSexoFechaTexto}{" "}
              <Typography
                variant="subtitle2"
                component="span"
                sx={{ fontWeight: 600, display: "flex", alignItems: "center" }}
              >
                Teléfono: {telefonoTexto}
                <Tooltip title={telefonoTooltipText}>
                  <span aria-hidden>{telefonoIcon}</span>
                </Tooltip>
              </Typography>
            </Typography>

            <Divider sx={{ my: 1 }} />

            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>Servicio:</strong> {activeTurno.servicio.nombre}
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>Especialidad:</strong> {activeTurno.especialidad.nombre}
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>Solicitado por:</strong> {medicoSolicitanteTexto}
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>Desde efector:</strong> {activeTurno.efector_solicitante.nombre}
            </Typography>
            {activeTurno.cupo && (
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                <strong>A:</strong> {activeTurno.efector.nombre}
              </Typography>
            )}
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>Prioridad:</strong> {String(activeTurno.prioridad)}
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>Fecha creación:</strong>{" "}
              {new Date(activeTurno.fecha_hora_creacion).toLocaleString()}
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>Días en espera:</strong> {diasEnEspera}
            </Typography>

            {activeTurno.estudio_requerido && activeTurno.estudio_requerido.length > 0 && (
              <>
                <Divider sx={{ my: 1 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                  Estudios requeridos
                </Typography>

                <Stack spacing={0.5}>
                  {activeTurno.estudio_requerido.map((e) => {
                    const cerrado = e.estado;

                    return (
                      <Box
                        key={e.id}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          opacity: cerrado ? 0.75 : 1,
                        }}
                      >
                        <FormControlLabel
                          control={
                            <Checkbox
                              size="small"
                              checked={cerrado || selectedEstudios.includes(e.id)}
                              disabled={cerrado}
                              onChange={() => handleToggleEstudio(e)}
                            />
                          }
                          label={
                            <Box component="span">
                              <Typography variant="body2" component="span" display="block">
                                {e.estudio_requerido.nombre ?? `#${e.id}`}
                              </Typography>
                              {cerrado && (
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  component="span"
                                  display="block"
                                >
                                  {new Date(e.fecha_cierre).toLocaleDateString()}
                                </Typography>
                              )}
                            </Box>
                          }
                        />
                      </Box>
                    );
                  })}
                </Stack>
              </>
            )}
          </Box>
        ) : (
          <Typography>Sin datos</Typography>
        )}
      </DialogContent>

      <DialogActions>
        {puedeEliminar && (
          <Button
            color="error"
            onClick={handleRemove}
            disabled={isRemovingActual}
            startIcon={isRemovingActual ? <CircularProgress size={16} /> : null}
          >
            Sacar de la lista de espera
          </Button>
        )}

        <Button onClick={handleCloseDialog}>Cerrar</Button>

        {tienePendientes && (
          <Button
            variant="contained"
            onClick={handleGuardarEstudios}
            disabled={deshabilitarGuardar}
          >
            Guardar estudios
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}