import { useCallback, useContext, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { AuthContext } from "../../common/contex";
import { getServiciosByEfector } from "../../features/efector/api";
import type { TurnoMerged, TurnoMergedFilters } from "../../features/informix/types";
import type { Efector, Servicio } from "../../features/efector/types";
import type { RespuestaCategory } from "../../features/informix/types";
import {
  resolveEndpoint,
  resolveDownloadEndpoint,
  DEFAULT_VISIBLE_COLUMNS,
} from "./utilsTurnos";


const PAGE_SIZE = 25;

export function useTurno() {
  const navigate = useNavigate();
  const { efectores } = useContext(AuthContext) as { efectores?: Efector[] };

  // ── estado de datos ──────────────────────────────────────────────────────
  const [turnos, setTurnos]           = useState<TurnoMerged[]>([]);
  const [loading, setLoading]         = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [total, setTotal]             = useState(0);
  const [page, setPage]               = useState(1);

  // ── filtros ──────────────────────────────────────────────────────────────
  const [servicios, setServicios]                 = useState<Servicio[]>([]);
  const [selectedEfectores, setSelectedEfectores] = useState<number[]>([]);
  const [selectedServicios, setSelectedServicios] = useState<number[]>([]);
  const [fechaDesde, setFechaDesde]               = useState<string | null>(null);
  const [fechaHasta, setFechaHasta]               = useState<string | null>(null);
  const [appliedFilters, setAppliedFilters]       = useState<TurnoMergedFilters | null>(null);
  const [hasSearched, setHasSearched]             = useState(false);

  // ── columnas ─────────────────────────────────────────────────────────────
  const [visibleColumns, setVisibleColumns] = useState<string[]>(DEFAULT_VISIBLE_COLUMNS);
  const [anchorCols, setAnchorCols]         = useState<null | HTMLElement>(null);

  // ── modos ─────────────────────────────────────────────────────────────────
  const [errorMode, setErrorMode]                   = useState(false);
  const [activeRespuestaCategory, setActiveRespuestaCategory] = useState<RespuestaCategory | null>(null);

  // respuestaMode se deriva: hay categoría seleccionada
  const respuestaMode = activeRespuestaCategory !== null;

  // ── ref de appliedFilters ─────────────────────────────────────────────────
  const appliedFiltersRef = useRef(appliedFilters);
  useEffect(() => { appliedFiltersRef.current = appliedFilters; }, [appliedFilters]);

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

  useEffect(() => { loadServicios(); }, [loadServicios]);

  // ── carga de página ───────────────────────────────────────────────────────
  async function loadPage(params: {
    pageToLoad:           number;
    filters:              TurnoMergedFilters;
    errorMode:            boolean;
    activeRespuestaCategory:  RespuestaCategory | null;
  }) {
    const { pageToLoad, filters, errorMode, activeRespuestaCategory } = params;
    const respuestaMode = activeRespuestaCategory !== null;

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
        ...(respuestaMode ? { tipo: activeRespuestaCategory } : {}),
      };

      const endpoint = resolveEndpoint({ errorMode, respuestaMode });
      const data     = await endpoint(requestFilters);
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
      const blob = await resolveDownloadEndpoint({ errorMode, respuestaMode })({
        ...appliedFilters,
        ...(respuestaMode ? { tipo: activeRespuestaCategory! } : {}),
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
      pageToLoad:          1,
      filters:             nextFilters,
      errorMode,
      activeRespuestaCategory,
    });
  }

  // ── toggle modos ──────────────────────────────────────────────────────────
  function handleToggleErrorMode() {
    const next = !errorMode;
    if (next) setActiveRespuestaCategory(null); // mutuamente exclusivo
    setErrorMode(next);
  }

  // Toggle de categoría: click en la activa la desactiva, click en otra la activa
  function handleSelectCategory(cat: RespuestaCategory) {
    if (activeRespuestaCategory === cat) {
      setActiveRespuestaCategory(null);
    } else {
      setActiveRespuestaCategory(cat);
      if (errorMode) setErrorMode(false); // mutuamente exclusivo
    }
  }

  // ── paginación ────────────────────────────────────────────────────────────
  function handleChangePage(_: React.ChangeEvent<unknown>, value: number) {
    setPage(value);
    if (!hasSearched || !appliedFilters) return;

    loadPage({
      pageToLoad:          value,
      filters:             appliedFilters,
      errorMode,
      activeRespuestaCategory,
    });
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // ── retorno ───────────────────────────────────────────────────────────────
  return {
    navigate,
    efectores,
    turnos,
    loading,
    downloading,
    total,
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
    respuestaMode,
    activeRespuestaCategory,
    handleBuscar,
    handleDescargar,
    handleChangePage,
    handleToggleErrorMode,
    handleSelectCategory,
  };
}