import { FormControl, InputLabel, Select, MenuItem, ListItemText, Checkbox } from "@mui/material"
import type { KeyNLabel } from "../../../common/types";


type Props = {
  servicios: KeyNLabel[];
  selectedServicios: number[];
  setSelectedServicios: React.Dispatch<React.SetStateAction<number[]>>;
};

export const ServicioForm =({servicios, selectedServicios, setSelectedServicios}: Props) => {
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
              .map((id) => servicios.find((x) => x.key === id)?.label ?? String(id))
              .join(", ")
          }
        >
          {servicios.length > 0 ? (
            servicios.map((se) => (
              <MenuItem key={se.key} value={se.key}>
                <Checkbox checked={selectedServicios.includes(se.key)} />
                <ListItemText primary={se.label} />
              </MenuItem>
            ))
          ) : (
            <MenuItem value="">(sin servicios)</MenuItem>
          )}
        </Select>
    </FormControl>
)}