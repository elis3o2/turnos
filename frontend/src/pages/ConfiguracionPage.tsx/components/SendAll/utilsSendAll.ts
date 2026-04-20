import type { EfeSerEspPlantillaExtend } from "../../../../features/mensaje/types";
import type { FieldName } from "../../utilsConfiguracion";

export const getToChange = (
  data: EfeSerEspPlantillaExtend[],
  field: FieldName,
  value: 0 | 1
) => {
  return data.filter((esp) => esp[field] !== value);
};