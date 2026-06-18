import { Box, FormControlLabel, Checkbox, Typography, Chip } from "@mui/material"
import type { EstudioRequerido } from "@/features/turno_espera/types"

type Props = {
    e: EstudioRequerido
    permiso: boolean
    selectedEstudios: number[]
    handleToggleEstudio: (e: EstudioRequerido) => void;
}

export const DetalleTurnoEstudioReq = ( { e, permiso, selectedEstudios, handleToggleEstudio } : Props ) => {
    const cerrado = e.estado;

    return ( 
    <Box
        key={e.id}
        sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            px: 1.5,
            py: 1,
            borderRadius: 2,
            bgcolor: cerrado ? "action.hover" : "background.paper",
            border: "0.5px solid",
            borderColor: cerrado ? "divider" : "divider",
            opacity: cerrado ? 0.7 : 1,
            transition: "background 0.15s",
            "&:hover": !cerrado
            ? { bgcolor: "action.hover" }
            : {},
        }}
        >
        <FormControlLabel
            sx={{ m: 0, flex: 1 }}
            control={
            <Checkbox
                size="small"
                checked={cerrado || selectedEstudios.includes(e.id)}
                disabled={cerrado || !permiso}
                onChange={() => handleToggleEstudio(e)}
                sx={{ mr: 1 }}
            />
            }
            label={
            <Box>
                <Typography variant="body2" sx={{ fontWeight: 500, fontSize: 13 }}>
                {e.estudio_requerido.nombre ?? `#${e.id}`}
                </Typography>
                {cerrado && (
                <Typography variant="caption" color="text.secondary" display="block">
                    Cerrado: {new Date(e.fecha_cierre).toLocaleDateString()}
                </Typography>
                )}
            </Box>
            }
        />
        {cerrado && (
        <Chip
            label="Completado"
            size="small"
            sx={{
                bgcolor: "#EAF3DE",
                color: "#27500A",
                border: "1px solid #97C459",
                fontSize: 10,
                fontWeight: 700,
                height: 20,
                "& .MuiChip-label": { px: 1 },
            }}
        />
        )}
        </Box>
    )
}