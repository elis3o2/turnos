import { Paper, IconButton, Typography, Stack, Chip } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

import type { EstudioRequerido } from "../../../features/turno_espera/types";
import LookEstudioRequerido from "../../../features/turno_espera/components/LookEstudioRequerido";

interface Props {
  estudioRequerido: EstudioRequerido[];
  setEstudioRequerido: React.Dispatch<React.SetStateAction<EstudioRequerido[]>>;
  finishEstudioRequerido: boolean;
  setFinishEstudioRequerido: React.Dispatch<React.SetStateAction<boolean>>;
  resetEstudioRequerido: () => void;
}

export const TarjetaEstudio = ({
  estudioRequerido,
  setEstudioRequerido,
  finishEstudioRequerido,
  setFinishEstudioRequerido,
  resetEstudioRequerido,
}: Props) => {
  
    const estudioStyle = {bgcolor: "secondary.light", color: "secondary.contrastText"};

    if (!finishEstudioRequerido) {
        return (
            <LookEstudioRequerido
            estudioRequerido={estudioRequerido}
            setEstudioRequerido={setEstudioRequerido}
            setFinishEstudioRequerido={setFinishEstudioRequerido}
            />
        );
    }

    return (
        <Paper elevation={2} sx={{ p: 2, mb: 2, position: "relative", ...estudioStyle }}>
            <IconButton
                size="small"
                onClick={resetEstudioRequerido}
                sx={{ position: "absolute", top: 8, right: 8 }}
                aria-label="Eliminar estudios"
                >
                <CloseIcon />
            </IconButton>

        <Typography variant="h6">Estudios requeridos</Typography>

        {estudioRequerido.length > 0 ? (
        <Stack direction="row" spacing={1} sx={{ mt: 1, flexWrap: "wrap" }}>
            {estudioRequerido.map((e) => (
                <Chip
                    key={e.id}
                    label={e.nombre ?? `#${e.id}`}
                    size="small"
                    sx={{ mb: 0.5 }}
                />
            ))}
        </Stack>
        ) : (
        <Typography sx={{ mt: 1 }}>(ninguno)</Typography>
        )}
        </Paper>
    );
};