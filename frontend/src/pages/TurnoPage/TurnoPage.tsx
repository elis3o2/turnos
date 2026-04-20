import React from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  GridLegacy as Grid,
  IconButton,
  Pagination,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ViewColumnIcon   from "@mui/icons-material/ViewColumn";
import GetAppIcon       from "@mui/icons-material/GetApp";
import RefreshIcon      from "@mui/icons-material/Refresh";
import MenuBookIcon     from "@mui/icons-material/MenuBook";

import type { TurnoMerged } from "../../features/informix/types";
import type { Mensaje } from "../../features/mensaje/types";
import { AlertaComponent } from "../../features/turno/components/AlertComponent";
import { TableComponent } from "../../common/components/TableComponent";
import { ColumnSelector } from "../../common/components/ColumnSelector";
import { EfectorListForm } from "../../features/efector/components/EfectorListForm";
import { ServicioListForm } from "../../features/efector/components/ServicioListForm";
import { DateTimeStack } from "../../common/components/DateTimeStack";
import { DateStack } from "../../common/components/DateStack";

import { useTurno }                  from "./useTurno";
import { ALL_COLUMNS, estadoChipColor, estadoRespChipColor } from "./utilsTurnos"

// ─── render helpers ──────────────────────────────────────────────────────────

function mensajeChip(m?: Mensaje | null) {
  if (!m) return <Typography variant="body2">—</Typography>;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, maxWidth: 120 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography variant="body2">{m.estado}</Typography>
        {m.fecha_envio ? <DateTimeStack value={m.fecha_envio} /> : null}
      </Box>
    </Box>
  );
}

function renderCell(columnKey: string, t: TurnoMerged): React.ReactNode {
  switch (columnKey) {
    case "id":      return t.id_sisr;
    case "respuesta":
      return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, width: "fit-content" }}>
          <Chip
            size="small"
            label={t.estado_paciente ?? "-"}
            color={estadoRespChipColor(t) as any}
            variant="outlined"
          />
          {t.fecha_estado_paciente ? <DateTimeStack value={t.fecha_estado_paciente} /> : null}
        </Box>
      );
    case "dni":           return t.paciente_dni;
    case "nombre":        return t.paciente_nombre;
    case "apellido":      return t.paciente_apellido;
    case "efector":       return t.efector;
    case "servicio":      return t.servicio;
    case "especialidad":  return t.especialidad;
    case "prof_nombre":   return t.profesional_nombre;
    case "prof_apellido": return t.profesional_apellido;
    case "estado":
      return (
        <Chip
          size="small"
          label={t.estado}
          color={estadoChipColor(t) as any}
          variant="outlined"
        />
      );
    case "fecha":          return <DateStack value={t.fecha} />;
    case "hora":           return t.hora ?? "—";
    case "asignacion":     return mensajeChip(t.mensaje_asociado.ASIGNACION);
    case "cancelacion":    return mensajeChip(t.mensaje_asociado.CANCELACION);
    case "reprogramacion": return mensajeChip(t.mensaje_asociado.REPROGRAMACION);
    case "recordatorio":   return mensajeChip(t.mensaje_asociado.RECORDATORIO);
    default:               return "—";
  }
}

// ─── component ───────────────────────────────────────────────────────────────

export default function TurnosPage() {
  const {
    navigate,
    efectores,
    turnos,
    loading,
    downloading,
    page,
    totalPages,
    hasSearched,
    servicios,
    selectedEfectores,    setSelectedEfectores,
    selectedServicios,    setSelectedServicios,
    fechaDesde,           setFechaDesde,
    fechaHasta,           setFechaHasta,
    visibleColumns,       setVisibleColumns,
    anchorCols,           setAnchorCols,
    errorMode,
    alertMode,
    activeAlertCategory,  setActiveAlertCategory,
    alertData,
    alertLoading,
    handleBuscar,
    handleDescargar,
    handleChangePage,
    handleToggleErrorMode,
    handleToggleAlertMode,
  } = useTurno();

  return (
    <Box sx={{ p: 2 }}>
      <AlertaComponent
        alertData={alertData}
        alertLoading={alertLoading}
        alertMode={alertMode}
        activeAlertCategory={activeAlertCategory}
        setActiveAlertCategory={setActiveAlertCategory}
        handleToggleAlertMode={handleToggleAlertMode}
      />

      <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            {efectores ? (
              <EfectorListForm
                efectores={efectores}
                selectedEfectores={selectedEfectores}
                setSelectedEfectores={setSelectedEfectores}
              />
            ) : "-"}
          </Grid>

          <Grid item xs={12} md={4}>
            <ServicioListForm
              servicios={servicios}
              selectedServicios={selectedServicios}
              setSelectedServicios={setSelectedServicios}
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <TextField
              size="small"
              label="Desde"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={fechaDesde ?? ""}
              onChange={(e) => setFechaDesde(e.target.value || null)}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <TextField
              size="small"
              label="Hasta"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={fechaHasta ?? ""}
              onChange={(e) => setFechaHasta(e.target.value || null)}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <Button
                startIcon={<RefreshIcon />}
                variant="outlined"
                onClick={handleBuscar}
                disabled={loading}
                size="small"
              >
                {loading ? <CircularProgress size={18} /> : "Buscar"}
              </Button>

              <Button
                startIcon={<WarningAmberIcon />}
                variant={errorMode ? "contained" : "outlined"}
                color={errorMode ? "error" : "inherit"}
                onClick={handleToggleErrorMode}
                disabled={loading}
                size="small"
              >
                Error mensajes
              </Button>

              <Button
                startIcon={downloading ? <CircularProgress size={16} /> : <GetAppIcon />}
                variant="contained"
                onClick={handleDescargar}
                disabled={loading || downloading || !hasSearched || turnos.length === 0}
                size="small"
              >
                Descargar
              </Button>

              <IconButton
                onClick={(e) => setAnchorCols(e.currentTarget)}
                size="small"
                title="Columnas"
              >
                <ViewColumnIcon fontSize="small" />
              </IconButton>

              <ColumnSelector
                columns={ALL_COLUMNS}
                value={visibleColumns}
                onChange={setVisibleColumns}
                anchorEl={anchorCols}
                onClose={() => setAnchorCols(null)}
              />

              <IconButton
                onClick={() => navigate("/historico")}
                size="small"
                title="Histórico"
              >
                <MenuBookIcon fontSize="small" />
              </IconButton>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      <TableComponent
        columns={ALL_COLUMNS}
        visibleColumns={visibleColumns}
        data={turnos}
        loading={loading}
        renderCell={renderCell}
      />

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Pagination
            count={totalPages}
            page={page}
            onChange={handleChangePage}
            color="primary"
            siblingCount={1}
            boundaryCount={1}
            showFirstButton
            showLastButton
          />
        </Stack>
      </Box>
    </Box>
  );
}