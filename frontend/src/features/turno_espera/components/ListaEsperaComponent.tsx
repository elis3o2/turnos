import { Box, Tooltip, Paper, Typography, Chip } from "@mui/material";        
import type { TurnoEspera } from "../types";

interface Props{
  visibleTurnos: TurnoEspera[],
  handleOpenDialog: (t: TurnoEspera) => void
}

export default function ListaEsperaComponent ({visibleTurnos, handleOpenDialog}: Props){
  
  const priorityColor = (p: number) => {
    if (p === 0) return "#EF4444";
    if (p === 1) return "#F59E0B";
    if (p === 2) return "#0baf26ff";
  };

  const medicoSolicitanteLabel = (t: TurnoEspera) => {
    const apellido = t.profesional_solicitante?.apellido ?? "";
    const nombre = t.profesional_solicitante?.nombre ?? "";
    if (apellido || nombre)
      return `${apellido}${apellido && nombre ? ", " : ""}${nombre}`;
    return "No registrado";
  };

  const diasEnEsperaNumber = (t: TurnoEspera): number => {
    try {
      const fecha = new Date(t.fecha_hora_creacion);
      const fechaMid = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate()).getTime();
      const today = new Date();
      const todayMid = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
      const days = Math.floor((todayMid - fechaMid) / (1000 * 60 * 60 * 24));
      return days >= 0 ? days : 0;
    } catch {
      return 0;
    }
};
  

  const diasEnEsperaLabel = (t: TurnoEspera) => `${diasEnEsperaNumber(t)} días`;

  const pacienteLabel = (t: TurnoEspera) => {
    const p = t.paciente;
    const apellido = p?.apellido ?? "";
    const nombre = p?.nombre ?? "";
    const dni = p?.nro_doc ?? null;
    if (apellido || nombre) {
      const base = `${apellido}${apellido && nombre ? ", " : ""}${nombre}`;
      return dni ? `${base} · DNI: ${dni}` : base;
    }
    return dni ? `Paciente · DNI: ${dni}` : "Paciente sin datos";
  };

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
        <Typography variant="caption" display="block">Solicitado por: {medicoSolicitanteLabel(t)}</Typography>
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
      const bg = priorityColor(t.prioridad ?? 0);
      return (
        <Tooltip key={t.id} title={tooltipContent(t)} placement="top" arrow>
          <Paper
            variant="outlined"
            sx={{ display: "flex", alignItems: "center", justifyContent: "space-between",
              overflow: "hidden", px: 1.5, height: 72, cursor: "pointer" }}
            onClick={() => handleOpenDialog(t)}
            role="button" tabIndex={0}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleOpenDialog(t); }}
          >
            <Box sx={{ display: "flex", alignItems: "center", width: "100%", gap: 2 }}>
              <Box sx={{ width: 10, height: 52, backgroundColor: bg, borderRadius: 1,
                flexShrink: 0, boxShadow: "0 1px 2px rgba(0,0,0,0.08)" }} aria-hidden />
              <Box sx={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                <Typography variant="body2"
                  sx={{ fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {pacienteLabel(t)}
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
                <Typography variant="body2" sx={{ fontWeight: 700, whiteSpace: "nowrap" }}>
                  {diasEnEsperaLabel(t)}
                </Typography>
              </Box>
              <Typography variant="caption" sx={{ color: "text.secondary" }}>Espera</Typography>
            </Box>
          </Paper>
        </Tooltip>
      );
    })}
  </Box>)
}
