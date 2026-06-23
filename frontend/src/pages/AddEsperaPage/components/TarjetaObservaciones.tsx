import { Paper, Typography, IconButton } from "@mui/material"
import CloseIcon from "@mui/icons-material/Close";
import type { Setter } from "@/common/types"
import ObservacionesComponent from "@/features/turno_espera/components/ObsevacionesComponent"

type Props = {
    observaciones: string
    setObservaciones: Setter<string>
    finishObservaciones: boolean
    setFinishObservaciones: Setter<boolean>
}


export const TarjetaObservaciones = ( { observaciones, setObservaciones, finishObservaciones, setFinishObservaciones } : Props) => {

    const style = { bgcolor: "#96238cff", color: "info.contrastText" }; // cian distinto

    return (
    !finishObservaciones ? (
        <ObservacionesComponent
            setObservaciones={setObservaciones}
            setFinishObservaciones={setFinishObservaciones}
        />
        ) : (
        <Paper elevation={2} sx={{ p: 2, mb: 2, position: "relative", ...style }}>
            <IconButton
                size="small"
                onClick={() => setFinishObservaciones(false)}
                sx={{ position: "absolute", top: 8, right: 8 }}
                aria-label="Editar"
                >
                <CloseIcon />
            </IconButton>

            <Typography variant="h6">Observaciones</Typography>
            <Typography
            sx={{
                whiteSpace: "pre-wrap",
                overflowWrap: "break-word",
                wordBreak: "break-word",
            }}
            >
            {observaciones == "" ? "(ninguna)" : observaciones}
            </Typography>
        </Paper>
        )
    )
}