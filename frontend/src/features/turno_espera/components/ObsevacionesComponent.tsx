import { useState } from "react";
import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { Setter } from "@/common/types";

type Props = {
  setObservaciones: Setter<string>;
  setFinishObservaciones: Setter<boolean>;
}

export default function ObservacionesComponent({ setObservaciones, setFinishObservaciones }: Props) {
  const [value, setValue] = useState("");

  const handleConfirm = () => {
    setObservaciones(value.trim());
    setFinishObservaciones(true);
  };

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", p: 1 }}>
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
            Observaciones
        </Typography>

    <Paper variant="outlined" sx={{ p: 2 }}>
        <TextField
            fullWidth
            multiline
            minRows={4}
            maxRows={8}
            label="Observaciones"
            placeholder="Ingrese observaciones..."
            onChange={(e) => setValue(e.target.value.slice(0, 256))}
            value={value}
            slotProps={{
                htmlInput: {
                maxLength: 256,
              },
            }}
        />

        <Stack
            direction="row"
            justifyContent="flex-end"
            sx={{ mt: 2 }}
        >
            <Button
                variant="contained"
                onClick={handleConfirm}
            >
                Confirmar
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}