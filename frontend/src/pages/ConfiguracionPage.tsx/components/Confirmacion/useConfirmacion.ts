import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { EfeSerEspPlantillaExtend } from "../../../../features/mensaje/types";
import { updateEfectorPlantilla } from "../../../../features/mensaje/api";
import type { Setter, AlertSeverity } from "../../../../common/types";
import type { FieldName } from "../../utilsConfiguracion";
import { getFieldLabel, getPlantField } from "./utilsConfirmacion";

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

export const useConfirmacion = ({
  onSuccess,
  onClosed,
  setOpen,
  field,
  value,
  confirmEspecialidades,
  setAlertOpen,
  setAlertMsg,
  setAlertSeverity,
}: Props) => {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);

  const handleClose = () => {
    if (busy) return;
    setOpen(false);
    onClosed?.();
  };

  const handleConfirmToggle = async () => {
    if (confirmEspecialidades.length === 0) {
      setAlertMsg("No hay especialidades seleccionadas.");
      setAlertSeverity("info");
      setAlertOpen(true);
      handleClose();
      return;
    }

    const ids = confirmEspecialidades.map((s) => s.id);

    // 🔥 ENCENDER → navegación
    if (value === 1) {
      navigate(`/plantillas/${field}`, {
        state: { especialidades: ids },
      });
      handleClose();
      return;
    }

    // 🔻 APAGAR → backend
    setBusy(true);

    try {
      const plantField = getPlantField(field);

      const payload = {
        [field]: 0,
        [plantField]: null,
      };

      const settled = await Promise.allSettled(
        ids.map((id) => updateEfectorPlantilla(id, payload))
      );

      let updated = 0;
      const failedIds: number[] = [];

      settled.forEach((res, idx) => {
        const esp = confirmEspecialidades[idx];

        if (res.status === "fulfilled") {
          updated++;
          onSuccess(esp, field, value);
        } else {
          failedIds.push(esp.id);
        }
      });

      if (failedIds.length === 0) {
        setAlertMsg(`${getFieldLabel(field)} actualizadas (${updated}).`);
        setAlertSeverity("success");
      } else {
        setAlertMsg(`Se actualizaron ${updated}/${ids.length}. Fallaron: ${failedIds.join(", ")}`);
        setAlertSeverity("warning");
      }

      setAlertOpen(true);
      handleClose();
    } catch (err) {
      console.error(err);
      setAlertMsg("No se pudo actualizar en el servidor");
      setAlertSeverity("error");
      setAlertOpen(true);
      handleClose();
    } finally {
      setBusy(false);
    }
  };

  const actionText =
    value === 1
      ? `Encender ${getFieldLabel(field)}`
      : `Apagar ${getFieldLabel(field)}`;

  return {
    busy,
    actionText,
    handleClose,
    handleConfirmToggle,
  };
};