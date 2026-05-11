import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText
} from "@mui/material";
import type { Efector } from "../types";

type Props = {
  efectores: Efector[];
  selectedEfectores: number[];
  setSelectedEfectores: React.Dispatch<React.SetStateAction<number[]>>;
};

export const EfectorListForm = ({efectores, selectedEfectores, setSelectedEfectores}: Props) => {
  return (
    <FormControl size="small" fullWidth sx={{ minWidth: 260, maxWidth: 520 }}>
      <InputLabel id="efector-select-label">Efector</InputLabel>

      <Select
        labelId="efector-select-label"
        multiple
        value={selectedEfectores}
        label="Efector"
        onChange={(e) =>
          setSelectedEfectores(e.target.value as number[])
        }
        renderValue={(selected) =>
          (selected as number[])
            .map(
              (id) =>
                efectores.find((x) => x.id === id)?.nombre ?? String(id)
            )
            .join(", ")
        }
        sx={{
          fontSize: 13,
          height: 36,
          '& .MuiSelect-select': {
            py: 0.5, 
          },
        }}
        MenuProps={{ PaperProps: { style: { maxHeight: 320 } } }}
      >
        {efectores.length > 0 ? (
          efectores.map((ef) => (
            <MenuItem key={ef.id} value={ef.id}>
              <Checkbox checked={selectedEfectores.includes(ef.id)} />
              <ListItemText primary={ef.nombre} />
            </MenuItem>
          ))
        ) : (
          <MenuItem value="">(sin efectores)</MenuItem>
        )}
      </Select>
    </FormControl>
  );
};
