import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText
} from "@mui/material";
import type { KeyNLabel } from "../../../common/types";

type Props = {
  efectores: KeyNLabel[];
  selectedEfectores: number[];
  setSelectedEfectores: React.Dispatch<React.SetStateAction<number[]>>;
};

export const EfectorForm = ({efectores, selectedEfectores, setSelectedEfectores}: Props) => {
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
                efectores.find((x) => x.key === id)?.label ?? String(id)
            )
            .join(", ")
        }
        sx={{ minWidth: 240 }}
        MenuProps={{ PaperProps: { style: { maxHeight: 320 } } }}
      >
        {efectores.length > 0 ? (
          efectores.map((ef) => (
            <MenuItem key={ef.key} value={ef.key}>
              <Checkbox checked={selectedEfectores.includes(ef.key)} />
              <ListItemText primary={ef.label} />
            </MenuItem>
          ))
        ) : (
          <MenuItem value="">(sin efectores)</MenuItem>
        )}
      </Select>
    </FormControl>
  );
};
