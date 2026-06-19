import { Paper, Typography, IconButton} from "@mui/material"
import CloseIcon from "@mui/icons-material/Close";

import LookProfesionalDeriva from "@/features/persona/components/LookProfesionalDeriva/LookProfesionalDeriva";
import type { Profesional } from "@/features/persona/types";
import type { Setter } from "@/common/types";

interface Props {
    efe_ser_esp: number
    profesionalDeriva: Profesional | null;
    setProfesionalDeriva: Setter<Profesional | null>;
    finishProfesionalDeriva: boolean;
    setFinishProfesionalDeriva: Setter<boolean>;
    resetProfesionalDeriva: () => void;
}


export const TarjetaProfesionalDeriva = ({efe_ser_esp, profesionalDeriva, setProfesionalDeriva, 
                        finishProfesionalDeriva, setFinishProfesionalDeriva, resetProfesionalDeriva, }: Props) => {
    
    const profesionalStyle = { bgcolor: "#1526bdff", color: "common.white" }; // violeta personalizado
    
    return (
        !finishProfesionalDeriva ? (
            <LookProfesionalDeriva
            efe_ser_esp={efe_ser_esp}
            setProfesionalDeriva={setProfesionalDeriva}
            setFinishProfesionalDeriva={setFinishProfesionalDeriva}
            />
        ) : (
            finishProfesionalDeriva && (
            <Paper elevation={2} sx={{ p: 2, mb: 2, position: "relative", ...profesionalStyle }}>
                <IconButton
                size="small"
                onClick={resetProfesionalDeriva}
                sx={{ position: "absolute", top: 8, right: 8, color: "common.white" }}
                aria-label="Eliminar profesional"
                >
                <CloseIcon />
                </IconButton>

                <Typography variant="h6">Profesional solicitado</Typography>
                <Typography>
                {profesionalDeriva
                    ? `${profesionalDeriva.apellido ?? "-"}, ${profesionalDeriva.nombre ?? "-"}`
                    : "(ninguno)"}
                </Typography>
            </Paper>
            )
        )
    )
}