import type { EfeSerEspPlantillaExtend } from "@/features/mensaje/types";
import { Stack, Tooltip, IconButton } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ReplayIcon from "@mui/icons-material/Replay";
import CancelIcon from "@mui/icons-material/Cancel";
import NotificationsIcon from "@mui/icons-material/Notifications";
import type { Setter, AlertSeverity } from "@/common/types";
import { Confirmacion } from "../Confirmacion/Confirmacion";
import { useSendAll } from "./useSendAll";
import type { FieldName } from "../../utilsConfiguracion";

type Props = {
  open: boolean;
  setOpen: Setter<boolean>;
  preFunction: () => Promise<EfeSerEspPlantillaExtend[]> | EfeSerEspPlantillaExtend[];
  setEspecialidades: Setter<EfeSerEspPlantillaExtend[]>;
  setEfectorEspecialidades: Setter<Record<number, Record<number, EfeSerEspPlantillaExtend[]>>>;
  confirmField: FieldName;
  setConfirmField: Setter<FieldName>;
  confirmValue: 0 | 1;
  setConfirmValue: Setter<0 | 1>;
  confirmEspecialidades: EfeSerEspPlantillaExtend[];
  setConfirmEspecialidades: Setter<EfeSerEspPlantillaExtend[]>;
  setAlertOpen: Setter<boolean>;
  setAlertMsg: Setter<string>;
  setAlertSeverity: Setter<AlertSeverity>;
};

const SendAll = (props: Props) => {
  const {
    open,
    setOpen,
    preFunction,
    setEspecialidades,
    setEfectorEspecialidades,
    confirmField,
    setConfirmField,
    confirmValue,
    setConfirmValue,
    confirmEspecialidades,
    setConfirmEspecialidades,
    setAlertMsg,
    setAlertSeverity,
    setAlertOpen,
  } = props;

  const {
    loadingField,
    handleFieldToggleAll,
    handleOnSuccess,
    onClosed,
  } = useSendAll({
    setOpen,
    preFunction,
    setEspecialidades,
    setEfectorEspecialidades,
    setConfirmField,
    setConfirmValue,
    setConfirmEspecialidades,
    setAlertOpen,
    setAlertMsg,
    setAlertSeverity,
  });

  return (
    <>
      <Confirmacion
        onSuccess={handleOnSuccess}
        onClosed={onClosed}
        open={open}
        setOpen={setOpen}
        field={confirmField}
        value={confirmValue}
        confirmEspecialidades={confirmEspecialidades}
        setAlertOpen={setAlertOpen}
        setAlertMsg={setAlertMsg}
        setAlertSeverity={setAlertSeverity}
      />

      <Stack direction="row" spacing={1} alignItems="center">
        <Tooltip title="Prender confirmación (todas)">
          <span>
            <IconButton size="small"

              aria-label="prender-asignacion"
              onClick={() => handleFieldToggleAll("asignacion", 1)}
              disabled={loadingField !== null}
            >
              <CheckCircleIcon sx={{ fontSize: 22, color: "success.main" }} />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Apagar confirmación (todas)">
          <span>
            <IconButton  size="small"
              aria-label="apagar-asignacion"
              onClick={() => handleFieldToggleAll("asignacion", 0)}
              disabled={loadingField !== null}
            >
              <CheckCircleIcon sx={{ fontSize: 22, color: "grey.500" }} />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Prender reprogramación (todas)">
          <span>
            <IconButton size="small"
              aria-label="prender-reprogramacion"
              onClick={() => handleFieldToggleAll("reprogramacion", 1)}
              disabled={loadingField !== null}
            >
              <ReplayIcon sx={{ fontSize: 22, color: "info.main" }} />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Apagar reprogramación (todas)">
          <span>
            <IconButton size="small"
              aria-label="apagar-reprogramacion"
              onClick={() => handleFieldToggleAll("reprogramacion", 0)}
              disabled={loadingField !== null}
            >
              <ReplayIcon sx={{ fontSize: 22, color: "grey.500" }} />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Prender cancelación (todas)">
          <span>
            <IconButton size="small"
              aria-label="prender-cancelacion"
              onClick={() => handleFieldToggleAll("cancelacion", 1)}
              disabled={loadingField !== null}
            >
              <CancelIcon sx={{ fontSize: 22, color: "error.main" }} />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Apagar cancelación (todas)">
          <span>
            <IconButton size="small"
              aria-label="apagar-cancelacion"
              onClick={() => handleFieldToggleAll("cancelacion", 0)}
              disabled={loadingField !== null}
            >
              <CancelIcon sx={{ fontSize: 22, color: "grey.500" }} />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Prender recordatorio (todas)">
          <span>
            <IconButton size="small"
              aria-label="prender-recordatorio"
              onClick={() => handleFieldToggleAll("recordatorio", 1)}
              disabled={loadingField !== null}
            >
              <NotificationsIcon sx={{ fontSize: 22, color: "warning.main" }} />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Apagar recordatorio (todas)">
          <span>
            <IconButton size="small"
              aria-label="apagar-recordatorio"
              onClick={() => handleFieldToggleAll("recordatorio", 0)}
              disabled={loadingField !== null}
            >
              <NotificationsIcon sx={{ fontSize: 22, color: "grey.500" }} />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>
    </>
  );
};

export default SendAll;