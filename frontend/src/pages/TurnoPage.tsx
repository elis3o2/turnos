import React, { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControl,
  FormControlLabel,
  GridLegacy as Grid,
  IconButton,
  InputLabel,
  ListItemText,
  MenuItem,
  Pagination,
  Paper,
  Select,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
  TableCell,
  Chip,
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import GetAppIcon from "@mui/icons-material/GetApp";
import RefreshIcon from "@mui/icons-material/Refresh";
import MenuBookIcon from "@mui/icons-material/MenuBook";

import { AuthContext } from "../common/contex";
import { getServiciosByEfector } from "../features/efector/api";
import { getTurnosMerged, getTurnosMergedAlerta, getTurnosMergedError } from "../features/turno/api";

import type { TurnoMerged, TurnoMergedFilters } from "../features/turno/types";
import type { KeyNLabel, KeySLabel } from "../common/types";
import { AlertaComponent } from "../features/turno/components/AlertComponent";
import { TableComponent } from "../common/components/TableComponent"
import {ColumnSelector } from "../common/components/ColumnSelector"
import { EfectorForm } from "../features/efector/components/EfectorForm";

type AlertCategory = "cancelados" | "incorrectos" | "sin_respuesta";

type AlertData = {
  count_total: number;
  grupos: {
    cancelados: TurnoMerged[];
    incorrectos: TurnoMerged[];
    sin_respuesta: TurnoMerged[];
  };
};

export default function TurnosPage() {
  const navigate = useNavigate();

  const { efectores } = useContext(AuthContext) as {
    efectores?: KeyNLabel[];
  };

  const [turnos, setTurnos] = useState<TurnoMerged[]>([]);
  const [loading, setLoading] = useState(false);

  const [servicios, setServicios] = useState<KeyNLabel[]>([]);
  const [selectedEfectores, setSelectedEfectores] = useState<number[]>([]);
  const [selectedServicios, setSelectedServicios] = useState<number[]>([]);
  const [fechaDesde, setFechaDesde] = useState<string | null>(null);
  const [fechaHasta, setFechaHasta] = useState<string | null>(null);

  const [appliedFilters, setAppliedFilters] = useState<TurnoMergedFilters | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const [anchorCols, setAnchorCols] = useState<null | HTMLElement>(null);
  const [compactView, setCompactView] = useState(false);

  const [page, setPage] = useState(1);
  const pageSize = 25;
  const [total, setTotal] = useState(0);

  const [errorMode, setErrorMode] = useState(false);
  const [alertMode, setAlertMode] = useState(false);
  const [activeAlertCategory, setActiveAlertCategory] =
    useState<AlertCategory>("cancelados");

  const [alertData, setAlertData] = useState<AlertData | null>(null);
  const [alertLoading, setAlertLoading] = useState(false);

  const allColumns = useMemo(
    () => [
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
      { key: "confirmacion", label: "Confirmación" },
      { key: "cancelacion", label: "Cancelación" },
      { key: "reprogramacion", label: "Reprogramación" },
      { key: "recordatorio", label: "Recordatorio" },
      { key: "fecha", label: "Fecha" },
      { key: "hora", label: "Hora" },
    ],
    []
  );

  const [visibleColumns, setVisibleColumns] = useState<string[]>(
      ["nombre", "apellido","prof_nombre", "prof_apellido"]);

  const visibleKeys = useMemo(
    () => allColumns.filter((c) => visibleColumns[c.key]).map((c) => c.key),
    [allColumns, visibleColumns]
  );

  const visibleCount = Math.max(1, visibleKeys.length);

  async function loadServicios() {
    if (selectedEfectores.length === 0) {
      setServicios([]);
      setSelectedServicios([]);
      return;
    }

    try {
      const data = await getServiciosByEfector(selectedEfectores);
      setServicios(data);
      setSelectedServicios((prev) =>
        prev.filter((id) => data.some((s) => s.value === id))
      );
    } catch (err) {
      console.error("Error cargando servicios", err);
      setServicios([]);
      setSelectedServicios([]);
    }
  }

  useEffect(() => {
    loadServicios();
  }, [selectedEfectores]);

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

      let data;
      if (alertMode) {
        data = await getTurnosMergedAlerta(requestFilters);
      } else if (errorMode) {
        data = await getTurnosMergedError(requestFilters);
      } else {
        data = await getTurnosMerged(requestFilters);
      }

      setTurnos(data.response ?? []);
      setTotal(data.count ?? 0);
    } catch (e) {
      console.error("Error cargando turnos paginados", e);
      setTurnos([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }

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

  useEffect(() => {
    const efIds = efectores?.map((e) => Number(e.key)) ?? [];
    if (efIds.length === 0) return;

    (async () => {
      setAlertLoading(true);
      try {
        const baseFilters = {
          cantidad: pageSize,
          offset: 0,
          ids_efec: efIds,
          ids_serv: [],
          fecha_desde: null,
          fecha_hasta: null,
        };

        const [resCancel, resIncorrect, resSinResp] = await Promise.all([
          getTurnosMergedAlerta({ ...baseFilters, tipo: "cancelados" }),
          getTurnosMergedAlerta({ ...baseFilters, tipo: "incorrectos" }),
          getTurnosMergedAlerta({ ...baseFilters, tipo: "sin_respuesta" }),
        ]);

        const grupos = {
          cancelados: resCancel.response ?? [],
          incorrectos: resIncorrect.response ?? [],
          sin_respuesta: resSinResp.response ?? [],
        };

        const count_total =
          (resCancel.count ?? 0) +
          (resIncorrect.count ?? 0) +
          (resSinResp.count ?? 0);

        setAlertData({ count_total, grupos });
      } catch (err) {
        console.error("Error cargando turnos alerta", err);
        setAlertData(null);
      } finally {
        setAlertLoading(false);
      }
    })();
  }, [efectores]);

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

  function estadoRespChipColor(t: TurnoMerged) {
    const n = t.estado_paciente ?? "";
    if (n === "SIN DATOS") return "info";
    if (n === "CONFIRMADO") return "success";
    if (n === "CANCELADO") return "error";
    if (n === "PERSONA INCORRECTA") return "warning";
    if (n === "SIN RESPUESTA") return "warning";
    return "default";
  }

  function estadoChipColor(t: TurnoMerged) {
    const n = t.estado ?? "";
    if (n === "ASIGNADO") return "success";
    if (n === "SUSPENDIDO") return "error";
    if (n === "REPROGRAMADO") return "warning";
    if (n === "FINALIZADO") return "info";
    return "default";
  }

  function renderCell(columnKey: string, t: TurnoMerged) {
    switch (columnKey) {
      case "respuesta":
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Chip size="small" label={t.estado_paciente ?? "-"} color={estadoRespChipColor(t) as any} variant="outlined" />
            {t.fecha_estado_paciente ? (
              <Typography variant="caption">{t.fecha_estado_paciente}</Typography>
            ) : null}
          </Box>
        );
      case "dni":
        return t.paciente_dni;
      case "nombre":
        return t.paciente_nombre;
      case "apellido":
        return t.paciente_apellido;
      case "efector":
        return t.efector;
      case "servicio":
        return t.servicio;
      case "especialidad":
        return t.especialidad;
      case "prof_nombre":
        return t.profesional_nombre;
      case "prof_apellido":
        return t.profesional_apellido;
      case "estado":
        return (<Chip size="small" label={t.estado} color={estadoChipColor(t) as any} variant="outlined"/>)
      case "fecha":
        return t.fecha ?? "—";
      case "hora":
        return t.hora ?? "—";
      default:
        return "—";
    }
  }

  return (
    <Box sx={{ p: 2 }}>
      <AlertaComponent
        alertData={alertData}
        alertLoading={alertLoading}
        alertMode={alertMode}
        activeAlertCategory={activeAlertCategory}
        setActiveAlertCategory={setActiveAlertCategory}
        handleToggleAlertMode={handleToggleAlertMode}
        noEfectoresAvailable={selectedEfectores.length === 0}
      />

      <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            {/* tu componente de efectores */}
            {efectores? 
            <EfectorForm 
            efectores={efectores}
            selectedEfectores={selectedEfectores}
            setSelectedEfectores={setSelectedEfectores}/>
            : "-"}
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl size="small" fullWidth>
              <InputLabel id="servicio-select-label">Servicio</InputLabel>
              <Select
                labelId="servicio-select-label"
                multiple
                value={selectedServicios}
                label="Servicio"
                onChange={(e) =>
                  setSelectedServicios(e.target.value as number[])
                }
                renderValue={(selected) =>
                  (selected as number[])
                    .map((id) => servicios.find((x) => x.key === id)?.label ?? String(id))
                    .join(", ")
                }
              >
                {servicios.length > 0 ? (
                  servicios.map((se) => (
                    <MenuItem key={se.key} value={se.key}>
                      <Checkbox checked={selectedServicios.includes(se.key)} />
                      <ListItemText primary={se.label} />
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem value="">(sin servicios)</MenuItem>
                )}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={2}>
            <TextField
              size="small"
              label="Desde"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={fechaDesde ?? ""}
              onChange={(e) =>
                setFechaDesde(e.target.value ? e.target.value : null)
              }
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
              onChange={(e) =>
                setFechaHasta(e.target.value ? e.target.value : null)
              }
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
                startIcon={<GetAppIcon />}
                variant="contained"
                disabled={loading || turnos.length === 0}
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
                value={visibleKeys}
                onChange={(nextKeys) => {setVisibleColumns(nextKeys)}}
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

          <Grid item xs={12} md={6}>
            <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={compactView}
                    onChange={() => setCompactView((v) => !v)}
                  />
                }
                label="Vista compacta"
              />
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

      <Box
        sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}
      >
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
