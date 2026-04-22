import type { Efector } from "../../../../features/efector/types";
import type { EfeSerEspPlantillaExtend } from "../../../../features/mensaje/types";
import {
  Box,
  Typography,
  Card,
  IconButton,
  Popper,
  Grow,
  Paper,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ReplayIcon from "@mui/icons-material/Replay";
import CancelIcon from "@mui/icons-material/Cancel";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { Confirmacion } from "../Confirmacion/Confitmacion";
import SendAll from "../SendAll/SendAll";
import type { Setter, AlertSeverity } from "../../../../common/types";
import {
  isFlagOn,
  getNombreEfector,
  getPlantillaPreview
} from "./utilsEspecialidadBlock";
import type { FieldName } from "../../utilsConfiguracion";
import { useEspecialidadBlock } from "./useEspecialidadBolck";

type Props = {
  open: boolean;
  setOpen: Setter<boolean>;
  especialidades: EfeSerEspPlantillaExtend[];
  setEspecialidades: Setter<EfeSerEspPlantillaExtend[]>;
  efectorSeleccionado: Efector[];
  confirmEspecialidades: EfeSerEspPlantillaExtend[];
  setConfirmEspecialidades: Setter<EfeSerEspPlantillaExtend[]>;
  confirmField: FieldName;
  setConfirmField: Setter<FieldName>;
  confirmValue: 0 | 1;
  setConfirmValue: Setter<0 | 1>;
  efecServEspecialidades: Record<number, Record<number, EfeSerEspPlantillaExtend[]>>;
  setEfecServEspecialidades: Setter<Record<number, Record<number, EfeSerEspPlantillaExtend[]>>>;
  setAlertOpen: Setter<boolean>;
  setAlertMsg: Setter<string>;
  setAlertSeverity: Setter<AlertSeverity>;
};

export const EspecialidadBlock = (props: Props) => {
  const {
    open,
    setOpen,
    especialidades,
    setEspecialidades,
    efectorSeleccionado,
    confirmEspecialidades,
    setConfirmEspecialidades,
    confirmField,
    setConfirmField,
    confirmValue,
    setConfirmValue,
    efecServEspecialidades,
    setEfecServEspecialidades,
    setAlertOpen,
    setAlertMsg,
    setAlertSeverity,
  } = props;

  const {
    anchorEl,
    hovered,
    openPopper,
    handleOnSuccess,
    handleSectionClick,
    handleConfirmClosed,
    allEspecialidadesToChange,
    handleMouseEnter,
    handleMouseLeave,
  } = useEspecialidadBlock(props);

  return (
    <>
      <Confirmacion
        onSuccess={handleOnSuccess}
        onClosed={handleConfirmClosed}
        open={open}
        setOpen={setOpen}
        field={confirmField}
        value={confirmValue}
        confirmEspecialidades={confirmEspecialidades}
        setAlertOpen={setAlertOpen}
        setAlertMsg={setAlertMsg}
        setAlertSeverity={setAlertSeverity}
      />

      <Box sx={{ mt: 4 }}>
        {especialidades.length === 0 ? (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              No hay especialidades cargadas para este servicio.
            </Typography>
          </Box>
        ) : (
          <>
            <SendAll
              open={open}
              setOpen={setOpen}
              preFunction={allEspecialidadesToChange}
              setEspecialidades={setEspecialidades}
              setEfectorEspecialidades={setEfecServEspecialidades}
              confirmField={confirmField}
              setConfirmField={setConfirmField}
              confirmValue={confirmValue}
              setConfirmValue={setConfirmValue}
              confirmEspecialidades={confirmEspecialidades}
              setConfirmEspecialidades={setConfirmEspecialidades}
              setAlertOpen={setAlertOpen}
              setAlertMsg={setAlertMsg}
              setAlertSeverity={setAlertSeverity}
            />

            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Box sx={{ width: "100%", maxWidth: 850, display: "flex", flexDirection: "column", gap: 2 }}>
                {especialidades.map((esp) => {
                  const nombreEspecialidad = esp.especialidad.nombre;
                  const nombreEfector = getNombreEfector(efectorSeleccionado, esp.id_efector);

                  const confirmOn = isFlagOn(esp.asignacion);
                  const reproOn   = isFlagOn(esp.reprogramacion);
                  const cancOn    = isFlagOn(esp.cancelacion);
                  const recoOn    = isFlagOn(esp.recordatorio);

                  const showEfectorName = (efectorSeleccionado?.length ?? 0) > 1 && !!nombreEfector;

                  return (
                    <Card
                      key={esp.id}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        borderRadius: 2,
                        boxShadow: 2,
                        overflow: "hidden",
                        border: "2px solid rgba(0,0,0,0.12)",
                        transition: "border-color 200ms, box-shadow 200ms",
                        "&:hover": { borderColor: "primary.main", boxShadow: 6 },
                        height: 56,
                        width: "100%",
                      }}
                    >
                      {/* Nombre */}
                      <Box sx={{ display: "flex", alignItems: "center", pl: 2, pr: 1, flex: "0 0 35%", minWidth: 0 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }} noWrap>
                          {nombreEspecialidad}
                          {showEfectorName && (
                            <Typography
                              component="span"
                              sx={{ fontSize: "1rem", fontWeight: 500, ml: 1, color: "text.secondary" }}
                            >
                              ({nombreEfector})
                            </Typography>
                          )}
                        </Typography>
                      </Box>

                      {/* Botones */}
                      <Box sx={{ display: "flex", alignItems: "stretch", flex: "0 0 65%", height: "100%" }}>
                        <IconButton
                          aria-label="asignacion"
                          onClick={() => handleSectionClick(esp, "asignacion")}
                          onMouseEnter={(e) => handleMouseEnter(e, esp.id, "asignacion", confirmOn)}
                          onMouseLeave={handleMouseLeave}
                          sx={{
                            flex: 1,
                            height: "100%",
                            minWidth: 0,
                            borderRadius: 0,
                            px: 0,
                            bgcolor: confirmOn ? "success.main" : "transparent",
                            color: confirmOn ? "success.contrastText" : "text.secondary",
                            "&:hover": { bgcolor: confirmOn ? "success.dark" : "action.hover" },
                          }}
                        >
                          <CheckCircleIcon fontSize="medium" />
                        </IconButton>

                        <IconButton
                          aria-label="reprogramacion"
                          onClick={() => handleSectionClick(esp, "reprogramacion")}
                          onMouseEnter={(e) => handleMouseEnter(e, esp.id, "reprogramacion", reproOn)}
                          onMouseLeave={handleMouseLeave}
                          sx={{
                            flex: 1,
                            height: "100%",
                            minWidth: 0,
                            borderRadius: 0,
                            px: 0,
                            bgcolor: reproOn ? "primary.main" : "transparent",
                            color: reproOn ? "primary.contrastText" : "text.secondary",
                            "&:hover": { bgcolor: reproOn ? "primary.dark" : "action.hover" },
                          }}
                        >
                          <ReplayIcon fontSize="medium" />
                        </IconButton>

                        <IconButton
                          aria-label="cancelacion"
                          onClick={() => handleSectionClick(esp, "cancelacion")}
                          onMouseEnter={(e) => handleMouseEnter(e, esp.id, "cancelacion", cancOn)}
                          onMouseLeave={handleMouseLeave}
                          sx={{
                            flex: 1,
                            height: "100%",
                            minWidth: 0,
                            borderRadius: 0,
                            px: 0,
                            bgcolor: cancOn ? "error.main" : "transparent",
                            color: cancOn ? "error.contrastText" : "text.secondary",
                            "&:hover": { bgcolor: cancOn ? "error.dark" : "action.hover" },
                          }}
                        >
                          <CancelIcon fontSize="medium" />
                        </IconButton>

                        <IconButton
                          aria-label="recordatorio"
                          onClick={() => handleSectionClick(esp, "recordatorio")}
                          onMouseEnter={(e) => handleMouseEnter(e, esp.id, "recordatorio", recoOn)}
                          onMouseLeave={handleMouseLeave}
                          sx={{
                            flex: 1,
                            height: "100%",
                            minWidth: 0,
                            borderRadius: 0,
                            px: 0,
                            borderLeft: "1px solid rgba(0,0,0,0.04)",
                            bgcolor: recoOn ? "warning.main" : "transparent",
                            color: recoOn ? "warning.contrastText" : "text.secondary",
                            "&:hover": { bgcolor: recoOn ? "warning.dark" : "action.hover" },
                          }}
                        >
                          <NotificationsIcon fontSize="medium" />
                        </IconButton>
                      </Box>
                    </Card>
                  );
                })}
              </Box>
            </Box>
          </>
        )}
      </Box>

      <Popper
        open={openPopper}
        anchorEl={anchorEl}
        placement="top"
        transition
        disablePortal
        modifiers={[{ name: "offset", options: { offset: [0, 8] } }]}
      >
        {({ TransitionProps }) => (
          <Grow {...TransitionProps} style={{ transformOrigin: "center bottom" }}>
            <Paper
              elevation={3}
              onMouseLeave={handleMouseLeave}
              sx={{ p: 1, maxWidth: 420, bgcolor: "background.paper", borderRadius: 1, boxShadow: 3 }}
            >
              <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                {hovered
                  ? getPlantillaPreview(
                      especialidades.find(e => e.id === hovered.espId) as EfeSerEspPlantillaExtend,
                      hovered.field
                    )
                  : ""}
              </Typography>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
};