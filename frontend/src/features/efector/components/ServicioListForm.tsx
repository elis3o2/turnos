import { FormControl, InputLabel, Select, MenuItem, ListItemText, Checkbox } from "@mui/material"
import type { Servicio } from "../types";


type Props = {
  servicios: Servicio[];
  selectedServicios: number[];
  setSelectedServicios: React.Dispatch<React.SetStateAction<number[]>>;
};

export const ServicioListForm =({servicios, selectedServicios, setSelectedServicios}: Props) => {
    return (
    <FormControl size="small" fullWidth>
        <InputLabel id="servicio-select-label">Servicio</InputLabel>
        <Select
          labelId="servicio-select-label"
          multiple
          value={selectedServicios}
          label="Servicio"
          onChange={(e) =>
            setSelectedServicios(e.target.value as number[])
          }
          renderValue={(selected) =>
            (selected as number[])
              .map((id) => servicios.find((x) => x.id === id)?.nombre ?? String(id))
              .join(", ")
          }
        >
          {servicios.length > 0 ? (
            servicios.map((se) => (
              <MenuItem key={se.id} value={se.id}>
                <Checkbox checked={selectedServicios.includes(se.id)} />
                <ListItemText primary={se.nombre} />
              </MenuItem>
            ))
          ) : (
            <MenuItem value="">(sin servicios)</MenuItem>
          )}
        </Select>
    </FormControl>
)}