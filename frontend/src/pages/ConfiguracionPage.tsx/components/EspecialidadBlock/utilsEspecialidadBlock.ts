import type { EfeSerEspPlantillaExtend } from "../../../../features/mensaje/types";
import type { FieldName } from "../../utilsConfiguracion";

export const isFlagOn = (v: number) => v === 1;

export const getNombreEfector = (
  efectorSeleccionado: { id: number; nombre: string }[],
  idEfector: number
) => efectorSeleccionado.find(e => e.id === idEfector)?.nombre ?? "";

export const getPlantillaPreview = (
  esp: EfeSerEspPlantillaExtend,
  field: FieldName
): string => {
  if (field === "asignacion") {
    return esp.plantilla_asig?.contenido ?? "No hay plantilla configurada";
  }

  if (field === "reprogramacion") {
    return esp.plantilla_repr?.contenido ?? "No hay plantilla configurada";
  }

  if (field === "cancelacion") {
    return esp.plantilla_canc?.contenido ?? "No hay plantilla configurada";
  }

  if (field === "recordatorio") {
    const dias = esp.dias_antes ?? "—";
    const contenido = esp.plantilla_reco?.contenido ?? "No hay plantilla configurada";
    return `Días antes: ${dias}\n\n${contenido}`;
  }

  return "";
};