import { useState, useMemo, useEffect, useCallback } from 'react';
import { getTurnoEsperaById } from '../../features/turno_espera/api';
import type { TurnoEspera } from '../../features/turno_espera/types';
import type { Paciente } from '../../features/persona/types';
import { ALL_COLUMNS, COLUMNS_MAP, downloadCSV } from './utilsEsperaHistorico';

// ---------------------- Hook ----------------------
export function useEsperaHistorico() {
  // --- Paciente ---
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [finishPaciente, setFinishPaciente] = useState(false);

  // --- Datos ---
  const [rows, setRows]     = useState<TurnoEspera[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState<string | null>(null);

  // --- Columnas visibles: todas activas por defecto ---
  const [visibleCols, setVisibleCols] = useState<Record<string, boolean>>(
    () => Object.fromEntries(ALL_COLUMNS.map(c => [c.key, true])),
  );

  const toggleColumn = useCallback((key: string) => {
    setVisibleCols(prev => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // --- Ordenamiento ---
  const [sortDesc, setSortDesc] = useState(true);
  const toggleSort = useCallback(() => setSortDesc(prev => !prev), []);

  // --- Fetch ---
  const fetchTurnos = useCallback(async (pacienteId: number) => {
    setError(null);
    setLoading(true);
    try {
      const data = await getTurnoEsperaById(pacienteId);
      setRows(data);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Error al consultar turnos';
      console.error(e);
      setError(msg);
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);
  console.log(rows)
  // Dispara automáticamente al confirmar paciente
  useEffect(() => {
    if (finishPaciente && paciente?.id) {
      fetchTurnos(paciente.id);
    }
  }, [finishPaciente, paciente, fetchTurnos]);

  // --- Handlers de UI ---
  const handleDeselect = useCallback(() => {
    setPaciente(null);
    setFinishPaciente(false);
    setRows([]);
    setError(null);
  }, []);



  // --- Datos derivados ---
  const displayedRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      const da = new Date(a.fecha_hora_creacion).getTime();
      const db = new Date(b.fecha_hora_creacion).getTime();
      return sortDesc ? db - da : da - db;
    });
  }, [rows, sortDesc]);

  const visibleKeys = useMemo(
    () => ALL_COLUMNS.filter(c => visibleCols[c.key]).map(c => c.key),
    [visibleCols],
  );

  const handleDownloadCSV = useCallback(() => {
    downloadCSV(displayedRows, visibleKeys, COLUMNS_MAP);
  }, [displayedRows, visibleKeys]);

  return {
    paciente,
    setPaciente,
    finishPaciente,
    setFinishPaciente,
    displayedRows,
    loading,
    error,
    visibleCols,
    toggleColumn,
    visibleKeys,
    sortDesc,
    toggleSort,
    handleDeselect,
    handleDownloadCSV,
  };
}