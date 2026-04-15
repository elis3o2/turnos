import React from "react";
import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import type { Efector } from "../types";
import type { KeyNLabel } from "../../../common/types";

type Props = {
  efectores: KeyNLabel[];
  selectedEfector: Efector | null;
  setSelectedEfector: React.Dispatch<React.SetStateAction<Efector | null>>;
};



export const EfectorForm = ({
  efectores,
  selectedEfector,
  setSelectedEfector,
}: Props) => {
  const handleChange = (e: SelectChangeEvent) => {
    const value = e.target.value;
    console.log(efectores)
    if (value === "") {
      setSelectedEfector(null);
      return;
    }

    const ef = efectores.find((x) => x.key === Number(value)) ?? null;

    setSelectedEfector(ef ? { id: ef.key, nombre: ef.label } : null);
  };

  return (
    <FormControl size="small" fullWidth>
      <InputLabel id="efector-label">Efector</InputLabel>
      <Select
        labelId="efector-label"
        label="Efector"
        value={selectedEfector?.id ? String(selectedEfector.id) : ""}
        onChange={handleChange}
      >
        <MenuItem value="">
          <em>Seleccioná un efector</em>
        </MenuItem>

        {efectores.map((ef) => (
          <MenuItem key={ef.key} value={String(ef.key)}>
            {ef.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};