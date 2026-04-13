import {
  Box, Button, Checkbox, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, Divider, FormControlLabel, IconButton,
  Stack, Tooltip, Typography,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CancelIcon from "@mui/icons-material/Cancel";
import type { EstudioRequerido, TurnoEspera } from "../types";

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

// ── helpers de módulo ────────────────────────────────────────────────────────

function telefonoEstado(
  carac: string | null | undefined,
  nro: string | null | undefined
) {
  const status: "missing" | "valid" | "invalid" =
    carac == null || nro == null
      ? "missing"
      : carac.length === 3 && nro.length === 7
      ? "valid"
      : "invalid";

  const icon =
    status === "valid" ? (
      <CheckCircleIcon sx={{ color: "success.main", ml: 1 }} fontSize="small" />
    ) : status === "missing" ? (
      <WarningAmberIcon sx={{ color: "warning.main", ml: 1 }} fontSize="small" />
    ) : (
      <CancelIcon sx={{ color: "error.main", ml: 1 }} fontSize="small" />
    );

  const tooltipText =
    status === "valid"
      ? "Teléfono válido"
      : status === "missing"
      ? "Teléfono no cargado"
      : "Teléfono no válido";

  return (
    <Typography
      variant="subtitle2"
      component="span"
      sx={{ fontWeight: 600, display: "flex", alignItems: "center" }}
    >
      Teléfono: {carac || "-"} - {nro || "-"}
      <Tooltip title={tooltipText}>
        <span aria-hidden>{icon}</span>
      </Tooltip>
    </Typography>
  );
}

function medicoSolicitanteLabel(t: TurnoEspera): string {
  const apellido = t.profesional_solicitante?.apellido ?? "";
  const nombre = t.profesional_solicitante?.nombre ?? "";
  if (apellido || nombre)
    return `${apellido}${apellido && nombre ? ", " : ""}${nombre}`;
  return "No registrado";
}

function diasEnEsperaNumber(t: TurnoEspera): number {
  try {
    const fecha = new Date(t.fecha_hora_creacion);
    const fechaMid = new Date(
      fecha.getFullYear(),
      fecha.getMonth(),
      fecha.getDate()
    ).getTime();
    const today = new Date();
    const todayMid = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    ).getTime();
    const days = Math.floor((todayMid - fechaMid) / (1000 * 60 * 60 * 24));
    return days >= 0 ? days : 0;
  } catch {
    return 0;
  }
}

// ── componente ───────────────────────────────────────────────────────────────

export default function DetalleTurnoDialog({
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
            {/* Paciente */}
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {activeTurno.paciente?.apellido ?? ""}
              {activeTurno.paciente?.nombre
                ? `, ${activeTurno.paciente.nombre}`
                : ""}
              {activeTurno.paciente?.nro_doc
                ? ` · DNI: ${activeTurno.paciente.nro_doc}`
                : ""}
            </Typography>

            <Typography
              variant="subtitle2"
              component="div"
              sx={{ fontWeight: 600 }}
            >
              Sexo: {activeTurno.paciente?.sexo ?? ""} {"  ·  "}
              Fecha de nacimiento:{" "}
              {String(activeTurno.paciente?.fecha_nacimiento ?? "")}
              {telefonoEstado(
                activeTurno.paciente?.carac_telef,
                activeTurno.paciente?.nro_telef
              )}
            </Typography>

            <Divider sx={{ my: 1 }} />

            {/* Turno */}
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>Servicio:</strong> {activeTurno.servicio.nombre}
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>Especialidad:</strong> {activeTurno.especialidad.nombre}
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>Solicitado por:</strong>{" "}
              {medicoSolicitanteLabel(activeTurno)}
            </Typography>
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              <strong>Desde efector:</strong>{" "}
              {activeTurno.efector_solicitante.nombre}
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
              <strong>Días en espera:</strong>{" "}
              {diasEnEsperaNumber(activeTurno)}
            </Typography>

            {/* Estudios requeridos */}
            {activeTurno.estudio_requerido &&
              activeTurno.estudio_requerido.length > 0 && (
                <>
                  <Divider sx={{ my: 1 }} />
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 700, mb: 1 }}
                  >
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
                                checked={
                                  cerrado || selectedEstudios.includes(e.id)
                                }
                                disabled={cerrado}
                                onChange={() => handleToggleEstudio(e)}
                              />
                            }
                            label={
                              <Box component="span">
                                <Typography
                                  variant="body2"
                                  component="span"
                                  display="block"
                                >
                                  {e.estudio_requerido.nombre ?? `#${e.id}`}
                                </Typography>
                                {cerrado && (
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    component="span"
                                    display="block"
                                  >
                                    {new Date(
                                      e.fecha_cierre
                                    ).toLocaleDateString()}
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
        {(selectedDerivacion === null || activeTurno?.cupo) && (
          <Button
            color="error"
            onClick={handleRemove}
            disabled={isRemoving(activeTurno?.id)}
            startIcon={
              isRemoving(activeTurno?.id) ? (
                <CircularProgress size={16} />
              ) : null
            }
          >
            Sacar de la lista de espera
          </Button>
        )}

        <Button onClick={handleCloseDialog}>Cerrar</Button>

        {activeTurno?.estudio_requerido?.some((e) => e.estado === false) && (
          <Button
            variant="contained"
            onClick={handleGuardarEstudios}
            disabled={!activeTurno || selectedEstudios.length === 0}
          >
            Guardar estudios
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}