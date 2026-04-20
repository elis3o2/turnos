import { Collapse, Box, Card, Typography, CardContent, GridLegacy as Grid } from "@mui/material";
import { useServicioBlock } from "./useServicioBlock";
import type { Efector, Servicio } from "../../../../features/efector/types";
import type { EfeSerEspPlantillaExtend } from "../../../../features/mensaje/types";
import type { Setter, AlertSeverity } from "../../../../common/types";


type Props = {
  efectorSeleccionado: Efector[];
  servicios: Servicio[];
  servicioSeleccionado: Servicio[];
  setServicioSeleccionado: Setter<Servicio[]>;
  especialidades: EfeSerEspPlantillaExtend[];
  setEspecialidades: Setter<EfeSerEspPlantillaExtend[]>;
  efecServEspecialidades: Record<number, Record<number, EfeSerEspPlantillaExtend[]>>;
  setEfecServEspecialidades: Setter<Record<number, Record<number, EfeSerEspPlantillaExtend[]>>>;
  servicioEfectorActual: Record<number, number[]>; // servicio_id -> [efector_id...]
  setServicioEfectorActual: Setter<Record<number, number[]>>;
  confirmField: "asignacion" | "reprogramacion" | "cancelacion" | "recordatorio";
  setConfirmField: Setter<"asignacion" | "reprogramacion" | "cancelacion" | "recordatorio">;
  confirmValue: 0 | 1;
  setConfirmValue: Setter<0 | 1>;
  confirmEspecialidades: EfeSerEspPlantillaExtend[];
  setConfirmEspecialidades: Setter<EfeSerEspPlantillaExtend[]>;
  setAlertOpen: Setter<boolean>;
  setAlertMsg: Setter<string>;
  setAlertSeverity: Setter<AlertSeverity>;
  open: boolean;
  setOpen: Setter<boolean>;
};


export const ServicioBlock = (props: Props) => {
  const {
    handleServicioClick,
    allEspecialidadesToChange,
  } = useServicioBlock(props);

  const {
    servicios,
    servicioSeleccionado,
    efectorSeleccionado,
  } = props;

  return (
    <Collapse in={efectorSeleccionado.length > 0 && servicios.length > 0}>
      <Box sx={{ mt: 4 }}>
        {/* header */}
        <SendAll preFunction={allEspecialidadesToChange} />

        <Grid container spacing={2}>
          {servicios.map(serv => (
            <Grid item key={serv.id}>
              <Card onClick={() => handleServicioClick(serv)}>
                <CardContent>
                  <Typography>{serv.nombre}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Collapse>
  );
};