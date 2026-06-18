import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import type { Servicio } from "../types";

type Props = {
  servicios: Servicio[];
  selectedServicio: Servicio | null;
  setSelectedServicio: (val: Servicio | null) => void
};



export const ServicioForm = ({ servicios, selectedServicio, setSelectedServicio }: Props) => {
  
  return (
    <FormControl fullWidth size="small" sx={{ mb: 2 }}>
        <InputLabel id="servicio-label">Servicio</InputLabel>
        <Select
            labelId="servicio-label"
            value={selectedServicio?.id ?? ""}
            label="Servicio"
            onChange={(e) => {
              const id = Number(e.target.value);
              const srv = servicios.find((s) => s.id === id) ?? null;
              setSelectedServicio(srv);
            }}
          sx={{
            fontSize: 13,
            height: 36,
            '& .MuiSelect-select': {
              py: 0.5, 
            },
          }}
        >
            <MenuItem value="">
            <em>-- Seleccioná servicio --</em>
            </MenuItem>
            {servicios.map((s) => (
            <MenuItem key={s.id} value={s.id}>
                {s.nombre}
            </MenuItem>
            ))}
        </Select>
    </FormControl>
    );
};