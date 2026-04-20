import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import type { Efector } from "../types";

type Props = {
  efectores: Efector[];
  selectedEfector: Efector | null;
  setSelectedEfector: (val: Efector | null) => void
};


export const EfectorForm = ({
  efectores,
  selectedEfector,
  setSelectedEfector,
}: Props) => {
  
  return (
    <FormControl size="small" fullWidth>
      <InputLabel id="efector-label">Efector</InputLabel>
      <Select
        labelId="efector-label"
        label="Efector"
        value={selectedEfector?.id ?? ""}
        onChange={(e) => {
            const id = Number(e.target.value);
            const ef = efectores.find((x) => x.id === id) ?? null;
            setSelectedEfector(ef);
          }}>
        <MenuItem value="">
          <em>Seleccioná un efector</em>
        </MenuItem>

        {efectores.map((ef) => (
          <MenuItem key={ef.id} value={ef.id}>
            {ef.nombre}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};