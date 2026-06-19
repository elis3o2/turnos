import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import type { Efector } from "../types";
import type { Setter } from "@/common/types";

type Props = {
  efectores: Efector[];
  selectedEfector: Efector | null;
  setSelectedEfector: Setter<Efector | null>
};


export const EfectorForm = ({efectores, selectedEfector, setSelectedEfector,}: Props) => {

  return (
    <FormControl
      size="small"
      fullWidth
      sx={{
        minWidth: 0,
      }}
    >
      <InputLabel
        id="efector-label"
        sx={{
          fontSize: 13,
        }}
      >
        Efector
      </InputLabel>

      <Select
        labelId="efector-label"
        label="Efector"
        value={selectedEfector?.id ?? ""}
        onChange={(e) => {
          const id = Number(e.target.value);
          const ef = efectores.find((x) => x.id === id) ?? null;
          setSelectedEfector(ef);
        }}
        sx={{
          fontSize: 13,
          height: 36,
          '& .MuiSelect-select': {
            py: 0.5, 
          },
        }}
      >
        <MenuItem value="" sx={{ fontSize: 13 }}>
          <em>Seleccioná un efector</em>
        </MenuItem>

        {efectores.map((ef) => (
          <MenuItem key={ef.id} value={ef.id} sx={{ fontSize: 13 }}>
            {ef.nombre}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};