import { Box,  Typography, Paper} from "@mui/material"
import type { Efector } from "../../../features/efector/types";
import  { CircularProgress } from "@mui/material";

interface Props {
    loadingEfector: boolean;
    efector: Efector | null;
    errorEfector: string | null;
}

export const TarjetaEfector = ({loadingEfector, efector, errorEfector}: Props) => {

    const efectorStyle = { bgcolor: "primary.light", color: "primary.contrastText" }; 

    return (
        <Box>
        {/* Tarjeta Efector actual (color exclusivo) */}
        <Paper elevation={3} sx={{ p: 2, mb: 3, ...efectorStyle }}>
        <Typography variant="h6">Efector actual</Typography>
        <Typography variant="body2">
            {loadingEfector ? (
            <CircularProgress size={14} sx={{ ml: 1 }} />
            ) : efector ? (
            <strong>{efector.nombre ?? `#${efector.id}`}</strong>
            ) : 
            <em>Efector no encontrado</em>
            }
        </Typography>
        {errorEfector && (
            <Typography variant="caption" color="error">
            {errorEfector}
            </Typography>
        )}
        </Paper>
        </Box>
    )
}