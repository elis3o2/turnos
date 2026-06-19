import { Box, Tooltip, Paper, Typography, Chip } from "@mui/material";        
import type { TurnoEspera } from "../types";
import { getPriorityColor, getDiasEnEsperaNumber } from "../utils";
import { profesionaLabel, pacienteLabel } from "@/features/persona/utils";

interface Props{
  visibleTurnos: TurnoEspera[],
  handleOpenDialog: (t: TurnoEspera) => void
}

export default function ListaEsperaComponent ({visibleTurnos, handleOpenDialog}: Props){
  

  const diasEnEsperaLabel = (t: TurnoEspera) => `${getDiasEnEsperaNumber(t)} días`;

  const tooltipContent = (t: TurnoEspera) => {
    const p = t.paciente ?? {};
    return (
      <Box sx={{ maxWidth: 320 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          {p.apellido ?? ""}{p.apellido && p.nombre ? ", " : ""}{p.nombre ?? ""}
        </Typography>
        <Typography variant="caption" display="block">DNI: {p.nro_doc ?? "-"}</Typography>
        <Typography variant="caption" display="block">Servicio: {t.servicio.nombre}</Typography>
        <Typography variant="caption" display="block">Especialidad: {t.especialidad.nombre}</Typography>
        <Typography variant="caption" display="block">Solicitado por: {profesionaLabel(t.profesional_solicitante)}</Typography>
        <Typography variant="caption" display="block">Medico solicitado: {profesionaLabel(t.profesional_deriva)}</Typography>
        <Typography variant="caption" display="block">Desde: {t.efector_solicitante.nombre}</Typography>
        {t.cupo && (
          <Typography variant="caption" display="block">A: {t.efector.nombre}</Typography>
        )}
      </Box>
    );
  };
  
  return (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
    {visibleTurnos.map((t) => {
      const bg = getPriorityColor(t.prioridad ?? 0);
      return (
        <Tooltip key={t.id} title={tooltipContent(t)} placement="top" arrow>
          <Paper
            variant="outlined"
            sx={{ display: "flex", alignItems: "center", justifyContent: "space-between",
              overflow: "hidden", px: 1, height: 64, cursor: "pointer" }}
            onClick={() => handleOpenDialog(t)}
            role="button" tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleOpenDialog(t); }}
          >
            <Box sx={{ display: "flex", alignItems: "center", width: "100%", gap: 1 }}>
              <Box sx={{ width: 10, height: 40, backgroundColor: bg, borderRadius: 1,
                flexShrink: 0, boxShadow: "0 1px 2px rgba(0,0,0,0.08)" }} aria-hidden />
              <Box sx={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                <Typography variant="body2"
                  sx={{ fontSize: 13,fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {pacienteLabel(t.paciente)}
                </Typography>
                <Typography variant="caption"
                  sx={{ color: "text.secondary", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {t.servicio.nombre} · {t.especialidad.nombre}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ ml: 2, textAlign: "right", minWidth: 88, display: "flex",
              flexDirection: "column", alignItems: "flex-end", gap: 0.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {t.cupo && (
                  <Chip label="CUPO" size="small"
                    sx={{ fontWeight: 700, height: 20, lineHeight: "20px", px: 0.7 }} />
                )}
                <Typography variant="body2" sx={{ fontSize:13, fontWeight: 600, whiteSpace: "nowrap" }}>
                  {diasEnEsperaLabel(t)}
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Tooltip>
      );
    })}
  </Box>)
}
