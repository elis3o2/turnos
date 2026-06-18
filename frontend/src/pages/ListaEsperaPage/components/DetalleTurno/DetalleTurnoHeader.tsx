import { Box, Typography, Chip } from "@mui/material"
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CancelIcon from "@mui/icons-material/Cancel";
import type { TurnoEspera } from "@/features/turno_espera/types";
import { pacienteSexoFechaLabel, pacienteLabel, telefonoCompleto, getTelefonoEstado } from "@/features/persona/utils";
import { getDiasEnEsperaNumber } from "@/features/turno_espera/utils";

type Props = {
    activeTurno: TurnoEspera | null
}

export const DetalleTurnoHeader = ({ activeTurno } : Props) => {
  const telefonoEstado = getTelefonoEstado(activeTurno?.paciente.carac_telef, activeTurno?.paciente.nro_telef)

  const telefonoIcon =
    telefonoEstado === "valid" ? (
      <CheckCircleIcon sx={{ color: "success.main", fontSize: 16 }} />
    ) : telefonoEstado === "missing" ? (
      <WarningAmberIcon sx={{ color: "warning.main", fontSize: 16 }} />
    ) : (
      <CancelIcon sx={{ color: "error.main", fontSize: 16 }} />
    );  
  
  return ( 
    <Box
        sx={{
          background: "linear-gradient(135deg, #E6F1FB 0%, #EEF5FC 100%)",
          borderBottom: "2px solid #85B7EB",
          px: 3,
          pt: 2.5,
          pb: 2,
          position: "relative",
        }}
      >
        <Typography
          variant="overline"
          sx={{
            color: "#185FA5",
            fontWeight: 700,
            fontSize: 10,
            letterSpacing: 1.5,
            display: "block",
            mb: 0.5,
          }}
        >
        </Typography>

        {activeTurno && (
          <>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  bgcolor: "#B5D4F4",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <PersonOutlineIcon sx={{ color: "#0C447C", fontSize: 20 }} />
              </Box>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#0C447C", lineHeight: 1.2 }}>
                  {pacienteLabel(activeTurno.paciente)}
                </Typography>
                <Typography variant="body2" sx={{ color: "#185FA5", mt: 0.25 }}>
                  {pacienteSexoFechaLabel(activeTurno.paciente)}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1.5, flexWrap: "wrap" }}>
              <Chip
                icon={<AccessTimeIcon sx={{ fontSize: "14px !important" }} />}
                label={`${getDiasEnEsperaNumber(activeTurno)} días en espera`}
                size="small"
                sx={{
                  bgcolor: "#B5D4F4",
                  color: "#0C447C",
                  fontWeight: 600,
                  fontSize: 11,
                  border: "1px solid #85B7EB",
                  "& .MuiChip-icon": { color: "#0C447C" },
                }}
              />
                <Chip
                  icon={<Box component="span" sx={{ display: "flex", alignItems: "center" }}>{telefonoIcon}</Box>}
                  label={telefonoCompleto(activeTurno.paciente.carac_telef, activeTurno.paciente.nro_telef)}
                  size="small"
                  sx={{
                    bgcolor: "#B5D4F4",
                    color: "#0C447C",
                    fontWeight: 600,
                    fontSize: 11,
                    border: "1px solid #85B7EB",
                    cursor: "help",
                  }}
                />
            </Box>
          </>
        )}
      </Box>
    )
}