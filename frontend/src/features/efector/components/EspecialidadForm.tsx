import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import type { Especialidad } from "../types";

type Props = {
  especialidades: Especialidad[];
  selectedEspecialidad: Especialidad | null;
  setSelectedEspecialidad: (val: Especialidad | null) => void
};


export const EspecialidadForm = ({
  especialidades,
  selectedEspecialidad,
  setSelectedEspecialidad,
}: Props) => {
  
    return (
        <FormControl size="small" fullWidth>
            <InputLabel id="especialidad-label">Especialidad</InputLabel>
            <Select
              labelId="especialidad-label"
              value={selectedEspecialidad?.id ?? ""}
              label="Especialidad"
              onChange={(e) => {
                const id = Number(e.target.value);
                const esp = especialidades.find((x) => x.id === id) ?? null;
                setSelectedEspecialidad(esp);
              }}
            >
              <MenuItem value="">
                <em>-- Seleccioná especialidad --</em>
              </MenuItem>
              {especialidades.map((esp) => (
                <MenuItem key={esp.id} value={esp.id}>
                  {esp.nombre}
                </MenuItem>
              ))}
            </Select>
        </FormControl>
    )
};