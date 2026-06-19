import {Box, Typography, Stack, Card, Popover, Chip} from "@mui/material";
import { useState } from "react";
import { ESTADO_COLORS, DEFAULT_ESTADO_COLOR } from "@/features/mensaje/utils"

interface Props {
  estado: string;
  count: number;
  estadoTurno: Array<{ estado_turno: string; count: number }>;
}

export function EstadoRecordatorioCard({ estado, count, estadoTurno }: Props) {
  const colors = ESTADO_COLORS[estado] ?? DEFAULT_ESTADO_COLOR;
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const total = estadoTurno.reduce((sum, item) => sum + item.count, 0);

  return (
    <>
      <Card
        onClick={handleClick}
        sx={{
          background: colors.bg,
          border: `1.5px solid ${colors.border}`,
          borderRadius: 3,
          p: 1.25,
          textAlign: "center",
          cursor: "pointer",
          transition: "transform 0.15s ease, box-shadow 0.15s ease",
          "&:hover": {
            transform: "translateY(-2px)",
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
            textTransform: "uppercase",
            fontSize: 10,
          }}
        >
          {estado}
        </Typography>
        <Typography variant="h5" fontWeight={700} sx={{ color: colors.color, mt: 0.5 }}>
          {count.toLocaleString()}
        </Typography>
      </Card>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        transformOrigin={{ vertical: "bottom", horizontal: "center" }}
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)",
              border: "1px solid",
              borderColor: "divider",
              minWidth: 220,
              overflow: "hidden",
            },
          },
        }}
      >
        {/* Header con color del estado */}
        <Box
          sx={{
            background: colors.bg,
            borderBottom: `2px solid ${colors.border}`,
            px: 2.5,
            py: 1.75,
          }}
        >
          <Typography
            variant="overline"
            sx={{
              color: colors.color,
              fontWeight: 700,
              fontSize: 10,
              letterSpacing: 1.5,
            }}
          >
            Estado
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: colors.color,
              fontWeight: 700,
              lineHeight: 1.2,
            }}
          >
            {estado}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}>
            <Typography variant="body2" sx={{ color: colors.color, opacity: 0.75 }}>
              Total:
            </Typography>
            <Typography variant="body2" sx={{ color: colors.color, fontWeight: 700 }}>
              {count.toLocaleString()}
            </Typography>
          </Box>
        </Box>

        {/* Sección de estados de turno */}
        <Box sx={{ px: 2.5, py: 2, bgcolor: "background.paper" }}>
          <Typography
            variant="overline"
            sx={{
              color: "text.secondary",
              fontWeight: 700,
              fontSize: 10,
              letterSpacing: 1.5,
              display: "block",
              mb: 1.5,
            }}
          >
            Estados de turno
          </Typography>

          {estadoTurno.length === 0 ? (
            <Typography variant="body2" color="text.disabled" sx={{ fontStyle: "italic" }}>
              Sin estados de turno registrados
            </Typography>
          ) : (
            <Stack spacing={1}>
              {estadoTurno.map((item) => {
                const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
                return (
                  <Box key={item.estado_turno}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 0.5,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{ color: "text.primary", fontWeight: 500, fontSize: 13 }}
                      >
                        {item.estado_turno}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Typography
                          variant="body2"
                          sx={{ color: "text.secondary", fontSize: 12 }}
                        >
                          {item.count.toLocaleString()}
                        </Typography>
                        <Chip
                          label={`${pct}%`}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: 10,
                            fontWeight: 700,
                            bgcolor: colors.bg,
                            color: colors.color,
                            border: `1px solid ${colors.border}`,
                            "& .MuiChip-label": { px: 0.75 },
                          }}
                        />
                      </Box>
                    </Box>
                    {/* Barra de progreso */}
                    <Box
                      sx={{
                        height: 4,
                        borderRadius: 2,
                        bgcolor: "action.hover",
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        sx={{
                          height: "100%",
                          width: `${pct}%`,
                          background: colors.border,
                          borderRadius: 2,
                          transition: "width 0.4s ease",
                        }}
                      />
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          )}
        </Box>
      </Popover>
    </>
  );
}