import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  CircularProgress,
  GridLegacy as Grid,
  IconButton,
  Pagination,
  Paper,
  Stack,
  TextField,
  Typography,
  Chip,
} from "@mui/material";

import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import GetAppIcon from "@mui/icons-material/GetApp";
import RefreshIcon from "@mui/icons-material/Refresh";
import MenuBookIcon from "@mui/icons-material/MenuBook";

import { AuthContext } from "../common/contex";
import { getServiciosByEfector } from "../features/efector/api";
import { getTurnosMerged, getTurnosMergedAlerta, getTurnosMergedError,  downloadTurnosMerged,
  downloadTurnosMergedError,
  downloadTurnosMergedAlerta,} from "../features/informix/api";

import type { TurnoMerged, TurnoMergedFilters } from "../features/informix/types";
import type { KeyNLabel } from "../common/types";
import { AlertaComponent } from "../features/turno/components/AlertComponent";
import { TableComponent } from "../common/components/TableComponent";
import { ColumnSelector } from "../common/components/ColumnSelector";
import { EfectorListForm } from "../features/efector/components/EfectorListForm";
import type { Mensaje } from "../features/mensaje/types";
import { DateTimeStack } from "../common/components/DateTimeStack";
import { DateStack } from "../common/components/DateStack";
import { ServicioForm } from "../features/efector/components/ServicioForm";

type AlertCategory = "rechazados" | "incorrectos" | "sin_respuesta";

type AlertData = {
  count_total: number;
  grupos: {
    rechazados: TurnoMerged[];
    incorrectos: TurnoMerged[];
    sin_respuesta: TurnoMerged[];
  };
};

// ─── helpers ────────────────────────────────────────────────────────────────

/** Elige el endpoint correcto según el modo activo. */
function resolveEndpoint(
  mode: { errorMode: boolean; alertMode: boolean }
): typeof getTurnosMerged {
  if (mode.alertMode) return getTurnosMergedAlerta;
  if (mode.errorMode) return getTurnosMergedError;
  return getTurnosMerged;
}

function estadoRespChipColor(t: TurnoMerged) {
  const map: Record<string, "info" | "success" | "error" | "warning"> = {
    "SIN DATOS": "info",
    "CONFIRMADO": "success",
    "RECHAZADO": "error",
    "INCORRECTO": "warning",
    "SIN RESPUESTA": "warning",
  };
  return map[t.estado_paciente ?? ""] ?? "default";
}

function estadoChipColor(t: TurnoMerged) {
  const map: Record<string, "success" | "error" | "warning" | "info"> = {
    "LIBRE": "error",
    "SUSPENDIDO": "error",
    "ASIGNADO": "success",
    "ATENDIDO": "success",
    "AUSENTE": "error",
    "RECEPCIONADO": "info",
    "ELIMINADO": "error",
    "REPROGRAMADO": "warning",
  };
  return map[t.estado ?? ""] ?? "default";
}

// ─── component ──────────────────────────────────────────────────────────────

export default function TurnosPage() {
  const navigate = useNavigate();

  const { efectores } = useContext(AuthContext) as { efectores?: KeyNLabel[] };

  const [turnos, setTurnos] = useState<TurnoMerged[]>([]);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const [servicios, setServicios] = useState<KeyNLabel[]>([]);
  const [selectedEfectores, setSelectedEfectores] = useState<number[]>([]);
  const [selectedServicios, setSelectedServicios] = useState<number[]>([]);
  const [fechaDesde, setFechaDesde] = useState<string | null>(null);
  const [fechaHasta, setFechaHasta] = useState<string | null>(null);

  const [appliedFilters, setAppliedFilters] = useState<TurnoMergedFilters | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const [anchorCols, setAnchorCols] = useState<null | HTMLElement>(null);

  const [page, setPage] = useState(1);
  const pageSize = 25;
  const [total, setTotal] = useState(0);

  const [errorMode, setErrorMode] = useState(false);
  const [alertMode, setAlertMode] = useState(false);
  const [activeAlertCategory, setActiveAlertCategory] = useState<AlertCategory>("rechazados");

  const [alertData, setAlertData] = useState<AlertData | null>(null);
  const [alertLoading, setAlertLoading] = useState(false);

  const allColumns = useMemo(
    () => [
      { key: "id", label: "ID" },
      { key: "respuesta", label: "Respuesta" },
      { key: "dni", label: "DNI" },
      { key: "nombre", label: "Nombre" },
      { key: "apellido", label: "Apellido" },
      { key: "efector", label: "Efector" },
      { key: "servicio", label: "Servicio" },
      { key: "especialidad", label: "Especialidad" },
      { key: "prof_nombre", label: "Nombre profesional" },
      { key: "prof_apellido", label: "Apellido profesional" },
      { key: "estado", label: "Estado" },
      { key: "asignacion", label: "Asignación" },
      { key: "cancelacion", label: "Cancelación" },
      { key: "reprogramacion", label: "Reprogramación" },
      { key: "recordatorio", label: "Recordatorio" },
      { key: "fecha", label: "Fecha" },
      { key: "hora", label: "Hora" },
    ],
    []
  );

  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    "respuesta", "dni", "efector", "servicio", "especialidad", "estado",
    "asignacion", "cancelacion", "reprogramacion", "recordatorio", "fecha", "hora",
  ]);

  // ── servicios ──────────────────────────────────────────────────────────────

  const loadServicios = useCallback(async () => {
    if (selectedEfectores.length === 0) {
      setServicios([]);
      setSelectedServicios([]);
      return;
    }
    try {
      const data = await getServiciosByEfector(selectedEfectores);
      setServicios(data);
      setSelectedServicios((prev) => prev.filter((id) => data.some((s) => s.key === id)));
    } catch (err) {
      console.error("Error cargando servicios", err);
      setServicios([]);
      setSelectedServicios([]);
    }
  }, [selectedEfectores]);

  useEffect(() => {
    loadServicios();
  }, [loadServicios]);

  // ── paginación ─────────────────────────────────────────────────────────────

  async function loadPage(params: {
    pageToLoad: number;
    filters: TurnoMergedFilters;
    errorMode: boolean;
    alertMode: boolean;
    activeAlertCategory: AlertCategory;
  }) {
    const { pageToLoad, filters, errorMode, alertMode, activeAlertCategory } = params;

    if (!filters.ids_efec || filters.ids_efec.length === 0) {
      setTurnos([]);
      setTotal(0);
      return;
    }

    setLoading(true);
    try {
      const offset = (pageToLoad - 1) * pageSize;
      const requestFilters: TurnoMergedFilters = {
        ...filters,
        cantidad: pageSize,
        offset,
        ...(alertMode ? { tipo: activeAlertCategory } : {}),
      };

      const endpoint = resolveEndpoint({ errorMode, alertMode });
      const data = await endpoint(requestFilters);
      setTurnos(data.data ?? []);
      setTotal(data.count ?? 0);
    } catch (e) {
      console.error("Error cargando turnos paginados", e);
      setTurnos([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }

  // ── descarga CSV ───────────────────────────────────────────────────────────

  function resolveDownloadEndpoint(mode: { errorMode: boolean; alertMode: boolean }) {
    if (mode.alertMode)  return downloadTurnosMergedAlerta;
    if (mode.errorMode)  return downloadTurnosMergedError;
    return downloadTurnosMerged;
  }

  async function handleDescargar() {
    if (!appliedFilters || !appliedFilters.ids_efec?.length) return;
    setDownloading(true);
    try {
      const blob = await resolveDownloadEndpoint({ errorMode, alertMode })({
        ...appliedFilters,
        ...(alertMode ? { tipo: activeAlertCategory } : {}),
      });

      const url    = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href     = url;
      anchor.download = `turnos_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Error descargando CSV", e);
    } finally {
      setDownloading(false);
    }
  }

  // ── filtros y búsqueda ─────────────────────────────────────────────────────

  function buildAppliedFilters(): TurnoMergedFilters {
    const fallbackEfectores =
      selectedEfectores.length > 0
        ? selectedEfectores
        : (efectores?.map((e) => Number(e.key)) ?? []);

    return {
      ids_efec: fallbackEfectores,
      ids_serv: selectedServicios,
      fecha_desde: fechaDesde,
      fecha_hasta: fechaHasta,
      cantidad: pageSize,
      offset: 0,
      tipo: alertMode ? activeAlertCategory : undefined,
    };
  }

  async function handleBuscar() {
    const nextFilters = buildAppliedFilters();

    if (!nextFilters.ids_efec || nextFilters.ids_efec.length === 0) {
      setTurnos([]);
      setTotal(0);
      setHasSearched(false);
      return;
    }

    setAppliedFilters(nextFilters);
    setPage(1);
    setHasSearched(true);

    await loadPage({
      pageToLoad: 1,
      filters: nextFilters,
      errorMode,
      alertMode,
      activeAlertCategory,
    });
  }

  // ── modos ──────────────────────────────────────────────────────────────────

  function handleToggleErrorMode() {
    const next = !errorMode;
    if (next && alertMode) setAlertMode(false);
    setErrorMode(next);
  }

  function handleToggleAlertMode() {
    const next = !alertMode;
    if (next && errorMode) setErrorMode(false);
    setAlertMode(next);
  }

  // ── carga inicial de alertas ───────────────────────────────────────────────

  useEffect(() => {
    const efIds = efectores?.map((e) => Number(e.key)) ?? [];
    if (efIds.length === 0) return;

    (async () => {
      setAlertLoading(true);
      try {
        const baseFilters: TurnoMergedFilters = {
          cantidad: pageSize,
          offset: 0,
          ids_efec: efIds,
          ids_serv: [],
          fecha_desde: null,
          fecha_hasta: null,
        };

        const [resRechaz, resIncorrect, resSinResp] = await Promise.all([
          getTurnosMergedAlerta({ ...baseFilters, tipo: "rechazados" }),
          getTurnosMergedAlerta({ ...baseFilters, tipo: "incorrectos" }),
          getTurnosMergedAlerta({ ...baseFilters, tipo: "sin_respuesta" }),
        ]);

        setAlertData({
          count_total:
            (resRechaz.count ?? 0) +
            (resIncorrect.count ?? 0) +
            (resSinResp.count ?? 0),
          grupos: {
            rechazados: resRechaz.data ?? [],
            incorrectos: resIncorrect.data ?? [],
            sin_respuesta: resSinResp.data ?? [],
          },
        });
      } catch (err) {
        console.error("Error cargando turnos alerta", err);
        setAlertData(null);
      } finally {
        setAlertLoading(false);
      }
    })();
  }, [efectores]);

  // ── paginación ─────────────────────────────────────────────────────────────

  function handleChangePage(_: React.ChangeEvent<unknown>, value: number) {
    setPage(value);
    if (!hasSearched || !appliedFilters) return;

    loadPage({
      pageToLoad: value,
      filters: appliedFilters,
      errorMode,
      alertMode,
      activeAlertCategory,
    });
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // ── render de celdas ───────────────────────────────────────────────────────

  function mensajeChip(m?: Mensaje | null): JSX.Element {
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
      case "id":           return t.id_sisr;
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

  // ── JSX ────────────────────────────────────────────────────────────────────

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
            <ServicioForm
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
                columns={allColumns}
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
        columns={allColumns}
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