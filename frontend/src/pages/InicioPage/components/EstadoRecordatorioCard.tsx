import { Tooltip, Box, Typography, Stack, Card } from "@mui/material";
import { ESTADO_COLORS, DEFAULT_ESTADO_COLOR } from "../utilsMensajeDashboard";

interface Props {
    estado: string
    count: number
    estadoTurno: Array<{ estado_turno: string; count: number }>
}


export function EstadoRecordatorioCard({estado, count, estadoTurno,}: Props) {
  const colors = ESTADO_COLORS[estado] ?? DEFAULT_ESTADO_COLOR

  return (
    <Tooltip
      arrow
      placement="top"
      title={
        <Box sx={{ p: 0.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
            {estado}
          </Typography>

          {estadoTurno.length === 0 ? (
            <Typography variant="body2">Sin estados de turno</Typography>
          ) : (
            <Stack spacing={0.5}>
              {estadoTurno.map(item => (
                <Typography key={item.estado_turno} variant="body2">
                  • {item.estado_turno}: {item.count}
                </Typography>
              ))}
            </Stack>
          )}
        </Box>
      }
      componentsProps={{
        tooltip: {
          sx: {
            bgcolor: 'rgba(25, 25, 25, 0.97)',
            '& .MuiTooltip-arrow': {
              color: 'rgba(25, 25, 25, 0.97)',
            },
          },
        },
      }}
    >
      <Card
        sx={{
          background: colors.bg,
          border: `1.5px solid ${colors.border}`,
          borderRadius: 3,
          p: 1.25,
          textAlign: 'center',
          cursor: 'help',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: 3,
          },
        }}
      >
        <Typography
          variant="caption"
          sx={{
            color: colors.color,
            fontWeight: 600,
            letterSpacing: 1,
            textTransform: 'uppercase',
            fontSize: 10,
          }}
        >
          {estado}
        </Typography>
        <Typography variant="h5" fontWeight={700} sx={{ color: colors.color, mt: 0.5 }}>
          {count.toLocaleString()}
        </Typography>
      </Card>
    </Tooltip>
  )
}