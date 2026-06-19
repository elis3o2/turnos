import { Paper, Typography, IconButton } from "@mui/material"
import CloseIcon from "@mui/icons-material/Close";
import LookPaciente from "@/features/persona/components/LookPaciente/LookPaciente";
import type { Paciente } from "@/features/persona/types";
import type { Setter } from "@/common/types";

interface Props {
    paciente: Paciente | null;
    setPaciente: Setter<Paciente | null>;
    finishPaciente: boolean;
    setFinishPaciente: Setter<boolean>;
    resetPaciente: () => void;
}


export const TarjetaPaciente = ({paciente, setPaciente, finishPaciente, setFinishPaciente, resetPaciente}:Props) => {

    const pacienteStyle = { bgcolor: "info.light", color: "info.contrastText" }; // cian distinto

    return (
    !finishPaciente ? (
        <LookPaciente
            paciente={paciente}
            setPaciente={setPaciente}
            setFinishPaciente={setFinishPaciente}
        />
        ) : (
        <Paper elevation={2} sx={{ p: 2, mb: 2, position: "relative", ...pacienteStyle }}>
            <IconButton
            size="small"
            onClick={resetPaciente}
            sx={{ position: "absolute", top: 8, right: 8 }}
            aria-label="Eliminar paciente"
            >
            <CloseIcon />
            </IconButton>

            <Typography variant="h6">Paciente</Typography>
            <Typography>
            {paciente
                ? `${paciente.apellido ?? "-"}, ${paciente.nombre ?? "-"}`
                : "(ninguno)"}
            </Typography>
        </Paper>
        )
    )
}
