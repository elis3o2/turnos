import { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { AuthContext } from "../../common/contex";
import { getServiciosByEfector } from "../../features/efector/api";
import { getTurnosMergedAlerta } from "../../features/informix/api";
import type { TurnoMerged, TurnoMergedFilters } from "../../features/informix/types";
import type { Efector, Servicio } from "../../features/efector/types";

import {
  resolveEndpoint,
  resolveDownloadEndpoint,
  DEFAULT_VISIBLE_COLUMNS,
  type AlertCategory,
  type AlertData
} from "./utilsTurnos"

const PAGE_SIZE = 25;

export function useTurno() {
  const navigate = useNavigate();
  const { efectores } = useContext(AuthContext) as { efectores?: Efector[] };

  // ── estado de datos ──────────────────────────────────────────────────────
  const [turnos, setTurnos]       = useState<TurnoMerged[]>([]);
  const [loading, setLoading]     = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);

  // ── filtros ──────────────────────────────────────────────────────────────
  const [servicios, setServicios]                   = useState<Servicio[]>([]);
  const [selectedEfectores, setSelectedEfectores]   = useState<number[]>([]);
  const [selectedServicios, setSelectedServicios]   = useState<number[]>([]);
  const [fechaDesde, setFechaDesde]                 = useState<string | null>(null);
  const [fechaHasta, setFechaHasta]                 = useState<string | null>(null);
  const [appliedFilters, setAppliedFilters]         = useState<TurnoMergedFilters | null>(null);
  const [hasSearched, setHasSearched]               = useState(false);

  // ── columnas ─────────────────────────────────────────────────────────────
  const [visibleColumns, setVisibleColumns] = useState<string[]>(DEFAULT_VISIBLE_COLUMNS);
  const [anchorCols, setAnchorCols]         = useState<null | HTMLElement>(null);

  // ── modos ─────────────────────────────────────────────────────────────────
  const [errorMode, setErrorMode] = useState(false);
  const [alertMode, setAlertMode] = useState(false);
  const [activeAlertCategory, setActiveAlertCategory] =
    useState<AlertCategory>("rechazados");

  // ── alertas ───────────────────────────────────────────────────────────────
  const [alertData, setAlertData]     = useState<AlertData | null>(null);
  const [alertLoading, setAlertLoading] = useState(false);

  // ── servicios ─────────────────────────────────────────────────────────────

  const loadServicios = useCallback(async () => {
    if (selectedEfectores.length === 0) {
      setServicios([]);
      setSelectedServicios([]);
      return;
    }
    try {
      const data = await getServiciosByEfector(selectedEfectores);
      setServicios(data);
      setSelectedServicios((prev) =>
        prev.filter((id) => data.some((s) => s.id === id))
      );
    } catch (err) {
      console.error("Error cargando servicios", err);
      setServicios([]);
      setSelectedServicios([]);
    }
  }, [selectedEfectores]);

  useEffect(() => {
    loadServicios();
  }, [loadServicios]);

  // ── carga de página ───────────────────────────────────────────────────────

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
      const offset = (pageToLoad - 1) * PAGE_SIZE;
      const requestFilters: TurnoMergedFilters = {
        ...filters,
        cantidad: PAGE_SIZE,
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

  // ── descarga CSV ──────────────────────────────────────────────────────────

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

  // ── búsqueda ──────────────────────────────────────────────────────────────

  function buildAppliedFilters(): TurnoMergedFilters {
    const fallbackEfectores =
      selectedEfectores.length > 0
        ? selectedEfectores
        : (efectores?.map((e) => Number(e.id)) ?? []);

    return {
      ids_efec:    fallbackEfectores,
      ids_serv:    selectedServicios,
      fecha_desde: fechaDesde,
      fecha_hasta: fechaHasta,
      cantidad:    PAGE_SIZE,
      offset:      0,
      tipo:        alertMode ? activeAlertCategory : undefined,
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

  // ── toggle modos ──────────────────────────────────────────────────────────

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

  // ── carga inicial de alertas ──────────────────────────────────────────────

  useEffect(() => {
    const efIds = efectores?.map((e) => Number(e.id)) ?? [];
    if (efIds.length === 0) return;

    (async () => {
      setAlertLoading(true);
      try {
        const baseFilters: TurnoMergedFilters = {
          cantidad:    PAGE_SIZE,
          offset:      0,
          ids_efec:    efIds,
          ids_serv:    [],
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
            rechazados:    resRechaz.data ?? [],
            incorrectos:   resIncorrect.data ?? [],
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

  // ── paginación ────────────────────────────────────────────────────────────

  function handleChangePage(_: React.ChangeEvent<unknown>, value: number) {
    setPage(value);
    if (!hasSearched || !appliedFilters) return;

    loadPage({
      pageToLoad: value,
      filters:    appliedFilters,
      errorMode,
      alertMode,
      activeAlertCategory,
    });
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // ── retorno ───────────────────────────────────────────────────────────────

  return {
    // navegación
    navigate,
    efectores,

    // datos
    turnos,
    loading,
    downloading,
    total,
    page,
    totalPages,
    hasSearched,

    // filtros
    servicios,
    selectedEfectores,    setSelectedEfectores,
    selectedServicios,    setSelectedServicios,
    fechaDesde,           setFechaDesde,
    fechaHasta,           setFechaHasta,

    // columnas
    visibleColumns,       setVisibleColumns,
    anchorCols,           setAnchorCols,

    // modos
    errorMode,
    alertMode,
    activeAlertCategory,  setActiveAlertCategory,

    // alertas
    alertData,
    alertLoading,

    // handlers
    handleBuscar,
    handleDescargar,
    handleChangePage,
    handleToggleErrorMode,
    handleToggleAlertMode,
  };
}