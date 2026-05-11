import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  FormControlLabel,
  Stack,
  Tooltip,
  Typography,
  Chip,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CancelIcon from "@mui/icons-material/Cancel";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import type { EstudioRequerido, TurnoEspera } from "../../../../features/turno_espera/types";
import { useDetalleTurno } from "./useDetalleTurno";
import { mapPriorityIdName } from "../../../../features/turno_espera/utils";

interface Props {
  permiso: boolean,
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
  permiso,
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
      <CheckCircleIcon sx={{ color: "success.main", fontSize: 16 }} />
    ) : telefonoEstado === "missing" ? (
      <WarningAmberIcon sx={{ color: "warning.main", fontSize: 16 }} />
    ) : (
      <CancelIcon sx={{ color: "error.main", fontSize: 16 }} />
    );

  return (
    <Dialog
      open={openDialog}
      onClose={handleCloseDialog}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)",
        },
      }}
    >
      {/* Header con fondo de color */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #E6F1FB 0%, #EEF5FC 100%)",
          borderBottom: "2px solid #85B7EB",
          px: 3,
          pt: 2.5,
          pb: 2,
          position: "relative",
        }}
      >
        <Typography
          variant="overline"
          sx={{
            color: "#185FA5",
            fontWeight: 700,
            fontSize: 10,
            letterSpacing: 1.5,
            display: "block",
            mb: 0.5,
          }}
        >
        </Typography>

        {activeTurno && (
          <>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  bgcolor: "#B5D4F4",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <PersonOutlineIcon sx={{ color: "#0C447C", fontSize: 20 }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#0C447C", lineHeight: 1.2 }}>
                  {pacienteTexto}
                </Typography>
                <Typography variant="body2" sx={{ color: "#185FA5", mt: 0.25 }}>
                  {pacienteSexoFechaTexto}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1.5, flexWrap: "wrap" }}>
              <Chip
                icon={<AccessTimeIcon sx={{ fontSize: "14px !important" }} />}
                label={`${diasEnEspera} días en espera`}
                size="small"
                sx={{
                  bgcolor: "#B5D4F4",
                  color: "#0C447C",
                  fontWeight: 600,
                  fontSize: 11,
                  border: "1px solid #85B7EB",
                  "& .MuiChip-icon": { color: "#0C447C" },
                }}
              />
              <Tooltip title={telefonoTooltipText}>
                <Chip
                  icon={<Box component="span" sx={{ display: "flex", alignItems: "center" }}>{telefonoIcon}</Box>}
                  label={telefonoTexto}
                  size="small"
                  sx={{
                    bgcolor: "#B5D4F4",
                    color: "#0C447C",
                    fontWeight: 600,
                    fontSize: 11,
                    border: "1px solid #85B7EB",
                    cursor: "help",
                  }}
                />
              </Tooltip>
            </Box>
          </>
        )}
      </Box>

      <DialogContent sx={{ p: 0, bgcolor: "background.paper" }}>
        {activeTurno ? (
          <Box>
            {/* Sección: Datos del turno */}
            <Box sx={{ px: 3, py: 2.5 }}>
              <Typography
                variant="overline"
                sx={{
                  color: "text.secondary",
                  fontWeight: 700,
                  fontSize: 10,
                  letterSpacing: 1.5,
                  display: "block",
                  mb: 1.5,
                }}
              >
                Información del turno
              </Typography>

              <Stack spacing={0.75}>
                {[
                  { label: "Servicio", value: activeTurno.servicio.nombre },
                  { label: "Especialidad", value: activeTurno.especialidad.nombre },
                  { label: "Solicitado por", value: medicoSolicitanteTexto },
                  { label: "Desde efector", value: activeTurno.efector_solicitante.nombre },
                  ...(activeTurno.cupo ? [{ label: "A", value: activeTurno.efector.nombre }] : []),
                  { label: "Prioridad", value: mapPriorityIdName[activeTurno.prioridad] },
                  {
                    label: "Fecha creación",
                    value: new Date(activeTurno.fecha_hora_creacion).toLocaleString(),
                  },
                ].map(({ label, value }) => (
                  <Box
                    key={label}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 2,
                      py: 0.5,
                      borderBottom: "0.5px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Typography variant="body2" sx={{ color: "text.secondary", flexShrink: 0, fontSize: 13 }}>
                      {label}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 500, textAlign: "right", fontSize: 13, color: "text.primary" }}
                    >
                      {value}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>

            {/* Sección: Estudios requeridos */}
            {activeTurno.estudios_requerido && activeTurno.estudios_requerido.length > 0 && (
              <>
                <Divider />
                <Box sx={{ px: 3, py: 2.5 }}>
                  <Typography
                    variant="overline"
                    sx={{
                      color: "text.secondary",
                      fontWeight: 700,
                      fontSize: 10,
                      letterSpacing: 1.5,
                      display: "block",
                      mb: 1.5,
                    }}
                  >
                    Estudios requeridos
                  </Typography>

                  <Stack spacing={0.5}>
                    {activeTurno.estudios_requerido.map((e) => {
                      const cerrado = e.estado;
                      return (
                        <Box
                          key={e.id}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            px: 1.5,
                            py: 1,
                            borderRadius: 2,
                            bgcolor: cerrado ? "action.hover" : "background.paper",
                            border: "0.5px solid",
                            borderColor: cerrado ? "divider" : "divider",
                            opacity: cerrado ? 0.7 : 1,
                            transition: "background 0.15s",
                            "&:hover": !cerrado
                              ? { bgcolor: "action.hover" }
                              : {},
                          }}
                        >
                          <FormControlLabel
                            sx={{ m: 0, flex: 1 }}
                            control={
                              <Checkbox
                                size="small"
                                checked={cerrado || selectedEstudios.includes(e.id)}
                                disabled={cerrado || !permiso}
                                onChange={() => handleToggleEstudio(e)}
                                sx={{ mr: 1 }}
                              />
                            }
                            label={
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 500, fontSize: 13 }}>
                                  {e.estudio_requerido.nombre ?? `#${e.id}`}
                                </Typography>
                                {cerrado && (
                                  <Typography variant="caption" color="text.secondary" display="block">
                                    Cerrado: {new Date(e.fecha_cierre).toLocaleDateString()}
                                  </Typography>
                                )}
                              </Box>
                            }
                          />
                          {cerrado && (
                            <Chip
                              label="Completado"
                              size="small"
                              sx={{
                                bgcolor: "#EAF3DE",
                                color: "#27500A",
                                border: "1px solid #97C459",
                                fontSize: 10,
                                fontWeight: 700,
                                height: 20,
                                "& .MuiChip-label": { px: 1 },
                              }}
                            />
                          )}
                        </Box>
                      );
                    })}
                  </Stack>
                </Box>
              </>
            )}
          </Box>
        ) : (
          <Box sx={{ px: 3, py: 4, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              Sin datos disponibles
            </Typography>
          </Box>
        )}
      </DialogContent>

      {/* Footer */}
      <DialogActions
        sx={{
          px: 3,
          py: 2,
          borderTop: "0.5px solid",
          borderColor: "divider",
          gap: 1,
          bgcolor: "background.paper",
        }}
      >
        {puedeEliminar && permiso && (
          <Button
            color="error"
            variant="outlined"
            onClick={handleRemove}
            disabled={isRemovingActual}
            startIcon={isRemovingActual ? <CircularProgress size={14} /> : null}
            size="small"
            sx={{ borderRadius: 2, mr: "auto" }}
          >
            Sacar de lista de espera
          </Button>
        )}

        <Button
          onClick={handleCloseDialog}
          size="small"
          sx={{ borderRadius: 2, color: "text.secondary" }}
        >
          Cerrar
        </Button>

        {tienePendientes && permiso && (
          <Button
            variant="contained"
            onClick={handleGuardarEstudios}
            disabled={deshabilitarGuardar}
            size="small"
            sx={{
              borderRadius: 2,
              bgcolor: "#185FA5",
              "&:hover": { bgcolor: "#0C447C" },
              boxShadow: "none",
            }}
          >
            Guardar estudios
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}