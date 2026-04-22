import {
  Box,
  Card,
  Typography,
  Avatar,
  GridLegacy as Grid,
  Button,
  Stack,
} from "@mui/material";
import { useConfirm } from "./useConfirm";
import { formatFecha, formatHora } from "./utilsConfirm";

export default function ConfirmPage() {
  const { datos, respuesta, estado, loading, turnoYaPaso, actualizarEstado } = useConfirm();

  if (loading) {
    return <p style={{ textAlign: "center" }}>Cargando...</p>;
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        padding: 16,
      }}
    >
      {datos && (
        <Card
          sx={{
            width: "100%",
            maxWidth: 520,
            borderRadius: 3,
            overflow: "hidden",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              backgroundColor: "#E1F5EE",
              px: 3,
              py: 2,
              borderBottom: "1px solid #9FE1CB",
            }}
          >
            <Typography sx={{ fontSize: 16, fontWeight: 500, color: "#085041" }}>
              Confirmación de turno
            </Typography>
            <Typography sx={{ fontSize: 13, color: "#0F6E56", mt: 0.5 }}>
              Revisá los datos y confirmá tu asistencia
            </Typography>
          </Box>

          <Box sx={{ px: 3, py: 2 }}>
            {/* Paciente */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                mb: 2,
                pb: 2,
                borderBottom: "1px solid #e0e0e0",
              }}
            >
              <Avatar
                sx={{
                  width: 44,
                  height: 44,
                  bgcolor: "#E3F2FD",
                  color: "#1565C0",
                  fontWeight: 500,
                }}
              >
                {datos.nombre?.[0]}
                {datos.apellido?.[0]}
              </Avatar>

              <Box>
                <Typography sx={{ fontWeight: 500 }}>
                  {datos.nombre} {datos.apellido}
                </Typography>
                <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                  Paciente
                </Typography>
              </Box>
            </Box>

            {/* Datos */}
            <Grid container spacing={1.5}>
              {[
                { label: "Fecha",        value: formatFecha(datos.fecha) },
                { label: "Hora",         value: formatHora(datos.hora) },
                { label: "Efector",      value: datos.efector,     full: true },
                { label: "Servicio",     value: datos.servicio },
                { label: "Especialidad", value: datos.especialidad },
              ].map(({ label, value, full }) => (
                <Grid item xs={full ? 12 : 6} key={label}>
                  <Typography
                    sx={{
                      fontSize: 11,
                      color: "text.secondary",
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {label}
                  </Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 500 }}>
                    {value ?? "-"}
                  </Typography>
                </Grid>
              ))}
            </Grid>

            {/* Botones */}
            {!turnoYaPaso && (estado === 0 || estado === 4) && respuesta === null && (
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                sx={{ mt: 3 }}
              >
                <Button fullWidth variant="contained" color="primary"
                  onClick={() => actualizarEstado(1, "confirmado")}>
                  Confirmar
                </Button>
                <Button fullWidth variant="contained" color="error"
                  onClick={() => actualizarEstado(2, "rechazado")}>
                  Cancelar
                </Button>
                <Button fullWidth variant="outlined" color="warning"
                  onClick={() => actualizarEstado(3, "desconocido")}>
                  Número incorrecto
                </Button>
              </Stack>
            )}

            {/* Respuestas */}
            {respuesta === "confirmado" && (
              <Typography sx={{ mt: 3, color: "success.main", fontWeight: 500 }}>
                Su turno ha sido confirmado
              </Typography>
            )}
            {respuesta === "rechazado" && (
              <Typography sx={{ mt: 3, color: "error.main", fontWeight: 500 }}>
                Su turno ha sido rechazado
              </Typography>
            )}
            {respuesta === "desconocido" && (
              <Typography sx={{ mt: 3, color: "warning.main", fontWeight: 500 }}>
                Se informó que el turno no corresponde a este paciente
              </Typography>
            )}
            {turnoYaPaso && respuesta === null && (
              <Typography sx={{ mt: 3, color: "text.secondary", fontWeight: 500 }}>
                Este turno ya pasó y no fue confirmado
              </Typography>
            )}
          </Box>

          {/* Estado */}
          <Box
            sx={{
              mt: 3,
              px: 2,
              py: 1.5,
              borderRadius: 2,
              backgroundColor: "#E1F5EE",
              border: "1px solid #9FE1CB",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography
              sx={{
                fontSize: 12,
                color: "#0F6E56",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                fontWeight: 500,
              }}
            >
              Estado del turno
            </Typography>
            <Typography sx={{ fontSize: 14, fontWeight: 600, color: "#085041" }}>
              {datos?.estado ?? "-"}
            </Typography>
          </Box>
        </Card>
      )}
    </div>
  );
}