import React from "react";
import type { EfeSerEspPlantillaExtend } from "@/features/mensaje/types";
import type { Setter, AlertSeverity } from "@/common/types";
import type { FieldName } from "../../utilsConfiguracion";
import { getToChange } from "./utilsSendAll";

type Props = {
  setOpen: Setter<boolean>;
  preFunction: () => Promise<EfeSerEspPlantillaExtend[]> | EfeSerEspPlantillaExtend[];
  setEspecialidades: Setter<EfeSerEspPlantillaExtend[]>;
  setEfectorEspecialidades: Setter<Record<number, Record<number, EfeSerEspPlantillaExtend[]>>>;
  setConfirmField: Setter<FieldName>;
  setConfirmValue: Setter<0 | 1>;
  setConfirmEspecialidades: Setter<EfeSerEspPlantillaExtend[]>;
  setAlertOpen: Setter<boolean>;
  setAlertMsg: Setter<string>;
  setAlertSeverity: Setter<AlertSeverity>;
};

export const useSendAll = ({
  setOpen,
  preFunction,
  setEspecialidades,
  setEfectorEspecialidades,
  setConfirmField,
  setConfirmValue,
  setConfirmEspecialidades,
  setAlertMsg,
  setAlertSeverity,
  setAlertOpen,
}: Props) => {
  const [loadingField, setLoadingField] = React.useState<null | FieldName>(null);

  const handleFieldToggleAll = async (field: FieldName, value: 0 | 1) => {
    if (loadingField) return;
    setLoadingField(field);

    try {
      const data = await Promise.resolve(preFunction());
      const toChange = getToChange(data, field, value);

      if (toChange.length === 0) {
        setAlertMsg("No hay especialidades que necesiten cambiar.");
        setAlertSeverity("info");
        setAlertOpen(true);
        return;
      }

      setConfirmField(field);
      setConfirmValue(value);
      setConfirmEspecialidades(toChange);
      setOpen(true);
    } catch (err) {
      console.error("Error preparando cambios:", err);
      setAlertMsg("Ocurrió un error preparando los cambios.");
      setAlertSeverity("error");
      setAlertOpen(true);
    } finally {
      setLoadingField(null);
    }
  };

  const updateCache = (
    esp: EfeSerEspPlantillaExtend,
    field: FieldName,
    value: 0 | 1
  ) => {
    const efId = esp.id_efector;
    const seId = esp.id_servicio;

    const updatedEsp = { ...esp, [field]: value } as EfeSerEspPlantillaExtend;

    setEfectorEspecialidades((prev) => {
      const next = { ...prev };

      if (!next[efId]) {
        next[efId] = {};
      }

      const currentList = next[efId][seId] || [];

      next[efId][seId] = currentList.map((e) =>
        e.id === esp.id ? updatedEsp : e
      );

      return next;
    });
  };

  const updateEspecialidades = (
    esp: EfeSerEspPlantillaExtend,
    field: FieldName,
    value: 0 | 1
  ) => {
    setEspecialidades((prev) =>
      prev.map((e) =>
        e.id === esp.id ? ({ ...e, [field]: value } as EfeSerEspPlantillaExtend) : e
      )
    );
  };

  const handleOnSuccess = (
    esp: EfeSerEspPlantillaExtend,
    field: FieldName,
    value: 0 | 1
  ) => {
    updateCache(esp, field, value);
    updateEspecialidades(esp, field, value);

    setConfirmEspecialidades((prev) =>
      prev.map((p) =>
        p.id === esp.id ? ({ ...p, [field]: value } as EfeSerEspPlantillaExtend) : p
      )
    );
  };

  const onClosed = () => setOpen(false);

  return {
    loadingField,
    handleFieldToggleAll,
    handleOnSuccess,
    onClosed,
  };
};