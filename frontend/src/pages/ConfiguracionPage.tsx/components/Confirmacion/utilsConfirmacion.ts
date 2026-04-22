import type { FieldName } from "../../utilsConfiguracion";

export const getFieldLabel = (field: FieldName) => {
  switch (field) {
    case "asignacion":
      return "Asignaciones";
    case "reprogramacion":
      return "Reprogramaciones";
    case "cancelacion":
      return "Cancelaciones";
    case "recordatorio":
      return "Recordatorios";
    default:
      return field;
  }
};

export const getPlantField = (field: FieldName) => {
  switch (field) {
    case "asignacion":
      return "plantilla_asig";
    case "reprogramacion":
      return "plantilla_repr";
    case "cancelacion":
      return "plantilla_canc";
    case "recordatorio":
      return "plantilla_reco";
  }
};