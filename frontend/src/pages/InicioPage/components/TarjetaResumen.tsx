import { Card, Box, CardContent, Typography } from "@mui/material"
import { StatCard } from "./StatCard"
import type { MensajeCount } from "@/features/mensaje/types"


type Props = {
    resumen: MensajeCount
}

export const TarjetaResumen = ( { resumen }: Props) => {

    return (
    <Box
    sx={{
        width: '70%',
        minWidth: 400,
        mx: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
    }}
    >
        <Card sx={{ textAlign: 'center', borderRadius: 4, boxShadow: 4, p: 2 }}>
            <CardContent>
            <Typography variant="overline" color="text.secondary" letterSpacing={2}>
                Total de mensajes
            </Typography>
            <Typography variant="h2" fontSize={35} fontWeight={700} sx={{ mt: 1 }}>
                {resumen.total.toLocaleString()}
            </Typography>
            </CardContent>
        </Card>

        <Box
            sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 2,
            }}
        >
            <StatCard label="Mensajes de asignación" value={resumen.total_asignacion} />
            <StatCard label="Mensajes de cancelación" value={resumen.total_cancelacion} />
            <StatCard label="Mensajes de reprogramación" value={resumen.total_reprogramacion} />
            <StatCard label="Mensajes de recordatorio" value={resumen.total_recordatorio} />
        </Box>
    </Box>
    )
}