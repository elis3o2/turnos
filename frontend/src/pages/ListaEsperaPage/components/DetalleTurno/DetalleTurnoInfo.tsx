import { DialogContent, Box, Typography, Divider, Stack } from "@mui/material";
import type { TurnoEspera, EstudioRequerido } from "@/features/turno_espera/types";
import { DetalleTurnoEstudioReq } from "./DetalleTurnoEstudioReq";
import { mapPriorityIdName } from "@/features/turno_espera/utils";
import { profesionaLabel } from "@/features/persona/utils";

type Props = {
    activeTurno: TurnoEspera | null
    permiso: boolean
    selectedEstudios: number[]
    handleToggleEstudio: (e: EstudioRequerido) => void;
}

export const DetalleTurnoInfo = ( { activeTurno, permiso, selectedEstudios, handleToggleEstudio } : Props) => {
    return (
    <DialogContent sx={{ p: 0, bgcolor: "background.paper" }}>
        {activeTurno ? (
          <Box>
            {/* Sección: Datos del turno */}
            <Box sx={{ px: 3, py: 2.5 }}>
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
                Información del turno
              </Typography>

              <Stack spacing={0.75}>
                {[
                  { label: "Servicio", value: activeTurno.servicio.nombre },
                  { label: "Especialidad", value: activeTurno.especialidad.nombre },
                  { label: "Solicitado por", value: profesionaLabel(activeTurno.profesional_solicitante) },
                  { label: "Profesional solicitado", value: profesionaLabel(activeTurno.profesional_deriva) },
                  { label: "Desde efector", value: activeTurno.efector_solicitante.nombre },
                  ...(activeTurno.cupo ? [{ label: "A", value: activeTurno.efector.nombre }] : []),
                  { label: "Prioridad", value: mapPriorityIdName[activeTurno.prioridad] },
                  {
                    label: "Fecha creación",
                    value: new Date(activeTurno.fecha_hora_creacion).toLocaleString(),
                  },
                ].map(({ label, value }) => (
                  <Box
                    key={label}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 2,
                      py: 0.5,
                      borderBottom: "0.5px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Typography variant="body2" sx={{ color: "text.secondary", flexShrink: 0, fontSize: 13 }}>
                      {label}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontWeight: 500, textAlign: "right", fontSize: 13, color: "text.primary" }}
                    >
                      {value}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Box>

            {/* Sección: Estudios requeridos */}
            {activeTurno.estudios_requerido && activeTurno.estudios_requerido.length > 0 && (
              <>
                <Divider />
                <Box sx={{ px: 3, py: 2.5 }}>
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
                    Estudios requeridos
                  </Typography>

                  <Stack spacing={0.5}>
                    {activeTurno.estudios_requerido.map((e) => {
                     return (
                     <DetalleTurnoEstudioReq
                        e={e}
                        permiso={permiso}
                        selectedEstudios={selectedEstudios}
                        handleToggleEstudio={handleToggleEstudio}
                    />)
                    })}
                  </Stack>
                </Box>
              </>
            )}
          </Box>
        ) : (
          <Box sx={{ px: 3, py: 4, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              Sin datos disponibles
            </Typography>
          </Box>
        )}
      </DialogContent>
    ) 
}