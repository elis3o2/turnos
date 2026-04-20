import type { EfeSerEspPlantillaExtend } from "../../../../features/mensaje/types";
import {
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import type { Setter, AlertSeverity } from "../../../../common/types";
import { useConfirmacion } from "./useConfirmacion";
import type { FieldName } from "../../utilsConfiguracion";

type Props = {
  onSuccess: (e: EfeSerEspPlantillaExtend, field: FieldName, value: 0 | 1) => void;
  onClosed?: () => void;
  open: boolean;
  setOpen: Setter<boolean>;
  field: FieldName;
  value: 0 | 1;
  confirmEspecialidades: EfeSerEspPlantillaExtend[];
  setAlertOpen: Setter<boolean>;
  setAlertMsg: Setter<string>;
  setAlertSeverity: Setter<AlertSeverity>;
};

export const Confirmacion = (props: Props) => {
  const {
    open,
    setOpen,
    field,
    value,
    confirmEspecialidades,
  } = props;

  const {
    busy,
    actionText,
    handleClose,
    handleConfirmToggle,
  } = useConfirmacion(props);

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>{actionText}</DialogTitle>

      <DialogContent>
        <Typography>
          {value === 1
            ? `Se van a seleccionar ${confirmEspecialidades.length} especialidades para asignar plantilla.`
            : `Se van a apagar ${confirmEspecialidades.length} especialidades y limpiar la plantilla.`}
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={busy}>
          Cancelar
        </Button>

        <Button
          onClick={handleConfirmToggle}
          disabled={busy}
          variant="contained"
        >
          Confirmar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

