import { Paper, Typography, IconButton} from "@mui/material"
import CloseIcon from "@mui/icons-material/Close";

import LookProfesional from "@/features/persona/components/LookProfesional/LookProfesional";
import type { Profesional } from "@/features/persona/types";
import type { Setter } from "@/common/types";

interface Props {
    efectorId: number
    profesional: Profesional | null;
    setProfesional: Setter<Profesional | null>;
    finishProfesional: boolean;
    setFinishProfesional: Setter<boolean>;
    resetProfesional: () => void;
}


export const TarjetaProfesional = ({efectorId, profesional, setProfesional, finishProfesional, setFinishProfesional, resetProfesional}: Props) => {
    
    const profesionalStyle = { bgcolor: "#8b5cf6", color: "common.white" }; // violeta personalizado
    
    return (
        !finishProfesional ? (
            <LookProfesional
            efectorId={efectorId}
            selectedProfesional={profesional}
            setProfesional={setProfesional}
            setFinishProfesional={setFinishProfesional}
            />
        ) : (
            finishProfesional && (
            <Paper elevation={2} sx={{ p: 2, mb: 2, position: "relative", ...profesionalStyle }}>
                <IconButton
                size="small"
                onClick={resetProfesional}
                sx={{ position: "absolute", top: 8, right: 8, color: "common.white" }}
                aria-label="Eliminar profesional"
                >
                <CloseIcon />
                </IconButton>

                <Typography variant="h6">Profesional que deriva</Typography>
                <Typography>
                {profesional
                    ? `${profesional.apellido ?? "-"}, ${profesional.nombre ?? "-"}`
                    : "(ninguno)"}
                </Typography>
            </Paper>
            )
        )
    )
}