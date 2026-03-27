import {
  Popover,
  Box,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
} from "@mui/material";
import type { KeySLabel } from "../types";



type Props = {
  columns: KeySLabel[];
  value: string[]; // columnas visibles
  onChange: (next: string[]) => void;

  anchorEl: HTMLElement | null;
  onClose: () => void;

  title?: string;
};

export function ColumnSelector({
  columns,
  value,
  onChange,
  anchorEl,
  onClose,
  title = "Columnas visibles",
}: Props){
  
  const isChecked = (key: string) => value.includes(key);

  const toggle = (key: string) => {
    if (isChecked(key)) {
      onChange(value.filter(k => k !== key));
    } else {
      onChange([...value, key]);
    }
  };

  const showAll = () => {
    onChange(columns.map(c => c.key));
  };

  const invert = () => {
    const next = columns
      .map(c => c.key)
      .filter(k => !value.includes(k));
    onChange(next);
  };

  return (
    <Popover
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
    >
      <Box sx={{ p: 2, minWidth: 260 }}>
        <Typography variant="subtitle2">{title}</Typography>

        <FormGroup>
          {columns.map(c => (
            <FormControlLabel
              key={String(c.key)}
              control={
                <Checkbox
                  checked={isChecked(c.key)}
                  onChange={() => toggle(c.key)}
                />
              }
              label={c.label}
            />
          ))}
        </FormGroup>

        <Box sx={{ display: "flex", gap: 1, mt: 1 }}>
          <Button size="small" onClick={() => { showAll(); onClose(); }}>
            Mostrar todo
          </Button>
          <Button size="small" onClick={() => { invert(); onClose(); }}>
            Invertir
          </Button>
        </Box>
      </Box>
    </Popover>
  );
}