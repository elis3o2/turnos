import { Collapse, Box, GridLegacy as Grid } from "@mui/material";
import { useServicioBlock } from "./useServicioBlock";
import type { Efector, Servicio } from "@/features/efector/types";
import type { EfeSerEspPlantillaExtend } from "@/features/mensaje/types";
import type { Setter, AlertSeverity } from "@/common/types";
import SendAll from "../SendAll/SendAll";
import { BurbujaCard } from "../BurbujaCard";

type Props = {
  permiso: boolean;
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
    permiso,
    servicios,
    servicioSeleccionado,
    efectorSeleccionado,
    setEspecialidades,
    setEfecServEspecialidades,  
    confirmField,
    setConfirmField,
    confirmValue,
    setConfirmValue,
    confirmEspecialidades,
    setConfirmEspecialidades,
    setAlertOpen,
    setAlertMsg,
    setAlertSeverity,
    open,
    setOpen,
  } = props;

  return (
    <Collapse in={efectorSeleccionado.length > 0 && servicios.length > 0}>
      <Box sx={{ mt: 4 }}>
        {permiso && <SendAll
          preFunction={allEspecialidadesToChange}
          open={open}
          setOpen={setOpen}
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
        />}

        <Grid container spacing={2}>
          {servicios.map(serv => (
            <Grid item key={serv.id}>
              <BurbujaCard
                name={serv.nombre}
                selected={servicioSeleccionado.some(s => s.id === serv.id)}
                onClick={()=> handleServicioClick(serv)}
                color="rgba(238, 200, 150, 1)"
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    </Collapse>
  );
};