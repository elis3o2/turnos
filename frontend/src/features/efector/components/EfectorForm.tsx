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
  selectedEfector: number;
  setSelectedEfector: React.Dispatch<React.SetStateAction<number[]>>;
};

export const EfectorListForm = ({efectores, selectedEfector, setSelectedEfector}: Props) => {
  return (
        <Grid item xs={12} sm={4} md={3}>
          <FormControl size="small" fullWidth>
            <InputLabel>Efector</InputLabel>
            <Select
              value={selectedEfector?.id ?? ""}
              label="Efector"
              onChange={(e) => {
                const ef = efectores?.find((x) => x.key === Number(e.target.value)) ?? null;
                setSelectedEfector(ef);
              }}
            >
              {efectores?.length ? (
                efectores.map((ef) => (
                  <MenuItem key={ef.key} value={ef.key}>{ef.label ?? `Efector ${ef.key}`}</MenuItem>
                ))
              ) : (
                <MenuItem value="">(sin efectores)</MenuItem>
              )}
            </Select>
          </FormControl>
        </Grid>
    ;
