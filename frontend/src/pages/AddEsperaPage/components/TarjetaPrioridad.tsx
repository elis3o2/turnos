import { Paper, Typography, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio } from "@mui/material"


interface Props {
    canSelectPriority: boolean;
    priority: string | null;
    setPriority: React.Dispatch<React.SetStateAction<string | null>>;
}

export const TarjetaPrioridad = ({canSelectPriority, priority, setPriority}: Props) => {

    const priorityBg = (p: string | null) => {
        if (p === "baja") return { bgcolor: "success.light", color: "success.contrastText" };
        if (p === "media") return { bgcolor: "warning.light", color: "warning.contrastText" };
        if (p === "alta") return { bgcolor: "error.light", color: "error.contrastText" };
        // default (sin seleccionar)
        return { bgcolor: "background.paper", color: "text.primary" };
    };

    const handlePriorityChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
        if (!canSelectPriority) return;
        setPriority((ev.target as HTMLInputElement).value);
    };

    return (
        <Paper elevation={2} sx={{ p: 2, mb: 2, position: "relative", ...priorityBg(priority) }}>
            <Typography variant="h6">Prioridad</Typography>

            <FormControl component="fieldset" sx={{ mt: 1 }}>
            <FormLabel component="legend" sx={{ mb: 1 }}>
                Seleccione prioridad
            </FormLabel>
            <RadioGroup
                row
                aria-label="prioridad"
                name="prioridad"
                value={priority ?? ""}
                onChange={handlePriorityChange}
            >
                <FormControlLabel value="baja" control={<Radio />} label="Baja" />
                <FormControlLabel value="media" control={<Radio />} label="Media" />
                <FormControlLabel value="alta" control={<Radio />} label="Alta" />
            </RadioGroup>
            </FormControl>

            {priority && (
            <Typography sx={{ mt: 1 }}>
                Prioridad seleccionada: <strong>{priority.toUpperCase()}</strong>
            </Typography>
            )}
        </Paper>
    )
}
