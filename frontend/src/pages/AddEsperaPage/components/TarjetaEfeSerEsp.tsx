import { Paper, IconButton, Typography, Stack } from "@mui/material"
import CloseIcon from "@mui/icons-material/Close";

import LookEfeSerEsp from "@/features/efector/components/LookEfeSerEsp/LookEfeSerEsp";
import type { Efector, EfeSerEspCompleto } from "@/features/efector/types";
import { useLookEfeSerEsp } from "@/features/efector/components/LookEfeSerEsp/useLookEfeSerEsp";
import type { Setter } from "@/common/types";

interface Props {
    efector: Efector;
    efeSerEspSeleccionado : EfeSerEspCompleto | null;
    setEfeSerEspSeleccionado: Setter<EfeSerEspCompleto | null>;
    finishEfeSerEsp: boolean;
    setFinishEfeSerEsp: Setter<boolean>;
    resetEfeSerEsp: () => void;
    setCupo: Setter<boolean>;
}


export const TarjetaEfeSerEsp = ({efector, efeSerEspSeleccionado, setEfeSerEspSeleccionado, finishEfeSerEsp, setFinishEfeSerEsp, resetEfeSerEsp, setCupo}: Props) => {
    
    const especialidadStyle = { bgcolor: "#cf7302ff", color: "common.white" }; // naranja con texto blanco
    const lookProps = useLookEfeSerEsp({efector, setEfeSerEspSeleccionado, setFinishEfeSerEsp, setCupo}); 

    return (
        !finishEfeSerEsp? (
            <LookEfeSerEsp {...lookProps}/>
        ) : (
            finishEfeSerEsp && (
            <Paper elevation={2} sx={{ p: 2, mb: 2, position: "relative", ...especialidadStyle }}>
                <IconButton
                size="small"
                onClick={resetEfeSerEsp}
                sx={{ position: "absolute", top: 8, right: 8 }}
                aria-label="Eliminar especialidad"
                >
                <CloseIcon />
                </IconButton>

                <Typography variant="h6">Especialidad / Servicio</Typography>
                <Stack spacing={0.5}>
                <Typography>
                    <strong>Efector:</strong>{" "}
                    {efeSerEspSeleccionado?.efector?.nombre ?? "(ninguno)"}
                </Typography>
                <Typography>
                    <strong>Servicio:</strong>{" "}
                    {efeSerEspSeleccionado?.servicio?.nombre ?? "(ninguno)"}
                </Typography>
                <Typography>
                    <strong>Especialidad:</strong>{" "}
                    {efeSerEspSeleccionado?.especialidad?.nombre ?? "(ninguno)"}
                </Typography>
                </Stack>
            </Paper>
            )
        )
    )
}