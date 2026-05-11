import React from "react";
import type { EfeSerEspPlantillaExtend } from "../../../../features/mensaje/types";
import type { Setter} from "../../../../common/types";
import type { FieldName } from "../../utilsConfiguracion";

type Props = {
  setOpen: Setter<boolean>;
  especialidades: EfeSerEspPlantillaExtend[];
  setEspecialidades: Setter<EfeSerEspPlantillaExtend[]>;
  setConfirmEspecialidades: Setter<EfeSerEspPlantillaExtend[]>;
  setConfirmField: Setter<FieldName>;
  setConfirmValue: Setter<0 | 1>;
  setEfecServEspecialidades: Setter<Record<number, Record<number, EfeSerEspPlantillaExtend[]>>>;
};

export const useEspecialidadBlock = ({
  setOpen,
  especialidades,
  setEspecialidades,
  setConfirmEspecialidades,
  setConfirmField,
  setConfirmValue,
  setEfecServEspecialidades,
}: Props) => {
  const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
  const [hovered, setHovered] = React.useState<{ espId: number; field: FieldName } | null>(null);

  const openPopper = Boolean(anchorEl && hovered);

  const updateCache = (esp: EfeSerEspPlantillaExtend, field: FieldName, value: 0 | 1) => {
    const efId = esp.id_efector;
    const servId = esp.id_servicio;
    if (!efId || !servId) return;

    setEfecServEspecialidades(prev => {
      const prevEf = prev[efId] || {};
      const prevArr =
        prevEf[servId] ||
        especialidades.filter(e => e.id_efector === efId && e.id_servicio === servId);

      const newArr = prevArr.map(e =>
        e.id === esp.id ? ({ ...e, [field]: value } as EfeSerEspPlantillaExtend) : e
      );

      return {
        ...prev,
        [efId]: {
          ...(prev[efId] || {}),
          [servId]: newArr,
        },
      };
    });
  };

  const updateEspecialidades = (
    esp: EfeSerEspPlantillaExtend,
    field: FieldName,
    value: 0 | 1
  ) => {
    setEspecialidades(prev =>
      prev.map(e => (e.id === esp.id ? ({ ...e, [field]: value } as EfeSerEspPlantillaExtend) : e))
    );
  };

  const handleOnSuccess = (esp: EfeSerEspPlantillaExtend, field: FieldName, value: 0 | 1) => {
    updateCache(esp, field, value);
    updateEspecialidades(esp, field, value);
  };

  const handleSectionClick = (esp: EfeSerEspPlantillaExtend, field: FieldName) => {
    const current = esp[field];
    const desired: 0 | 1 = current === 1 ? 0 : 1;

    setConfirmField(field);
    setConfirmValue(desired);
    setConfirmEspecialidades([esp]);
    setOpen(true);
  };

  const allEspecialidadesToChange = async (): Promise<EfeSerEspPlantillaExtend[]> => {
    return especialidades;
  };

  const handleConfirmClosed = () => {
    setConfirmEspecialidades([]);
    setOpen(false);
  };

  const handleMouseEnter = (
    e: React.MouseEvent<HTMLElement>,
    espId: number,
    field: FieldName,
    enabled: boolean
  ) => {
    if (!enabled) return;
    setAnchorEl(e.currentTarget);
    setHovered({ espId, field });
  };

  const handleMouseLeave = () => {
    setAnchorEl(null);
    setHovered(null);
  };

  return {
    anchorEl,
    hovered,
    openPopper,
    handleOnSuccess,
    handleSectionClick,
    handleConfirmClosed,
    allEspecialidadesToChange,
    handleMouseEnter,
    handleMouseLeave,
  };
};