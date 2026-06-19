import { useEffect, useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { Setter } from "@/common/types";
import type { Profesional } from "../../types";
import { getProfesionalByEfeSerEsp } from "../../api";

interface Props {
  efe_ser_esp: number;
  setProfesionalDeriva: Setter<Profesional | null>;
  setFinishProfesionalDeriva: Setter<boolean>;
}

export default function LookProfesional({
  efe_ser_esp,
  setProfesionalDeriva,
  setFinishProfesionalDeriva,
}: Props) {
  const [profesionales, setProfesionales] = useState<Profesional[]>([]);
  const [selected, setSelected] = useState<Profesional | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getProfesionalByEfeSerEsp(efe_ser_esp);
        setProfesionales(data);
      } catch (error) {
        console.error(error);
      }
    };

    load();
  }, [efe_ser_esp]);

  const handleConfirm = () => {
    setProfesionalDeriva(selected);
    setFinishProfesionalDeriva(true);
  };

  const handleSkip = () => {
    setProfesionalDeriva(null);
    setFinishProfesionalDeriva(true);
  };

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", p: 1 }}>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Profesional solicitado
      </Typography>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Autocomplete
          options={profesionales}
          value={selected}
          onChange={(_, value) => setSelected(value)}
          filterOptions={(options, state) => {
            const text = state.inputValue.trim().toLowerCase();

            if (!text) return options;

            return options.filter((p) => {
              const nombre = (p.nombre ?? "").toLowerCase();
              const apellido = (p.apellido ?? "").toLowerCase();

              return (
                nombre.includes(text) ||
                apellido.includes(text)
              );
            });
          }}
          getOptionLabel={(p) =>
            `${p.apellido ?? ""}, ${p.nombre ?? ""}`
          }
          isOptionEqualToValue={(option, value) =>
            option.id === value.id
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Buscar profesional"
              placeholder="Nombre o apellido"
            />
          )}
        />

        <Stack
          direction="row"
          spacing={2}
          justifyContent="flex-end"
          sx={{ mt: 2 }}
        >
          <Button
            variant="outlined"
            color="inherit"
            onClick={handleSkip}
          >
            No cargar
          </Button>

          <Button
            variant="contained"
            onClick={handleConfirm}
            disabled={!selected}
          >
            Confirmar
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}