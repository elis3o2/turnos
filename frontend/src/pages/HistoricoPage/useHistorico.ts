import { useState, useMemo, useEffect } from 'react';
import { getHistoricoTurno } from '@/features/informix/api';
import type { Paciente } from '@/features/persona/types';
import type { TurnoHistorico } from '@/features/informix/types';

export function useHistorico() {
  const [turnos, setTurnos] = useState<TurnoHistorico[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [finishPaciente, setFinishPaciente] = useState<boolean>(false);
  const [selectedEfector, setSelectedEfector] = useState<string>('ALL');

  const efectores = useMemo(
    () =>
      [...new Set(turnos.map(t => t.efector).filter(Boolean))]
        .sort((a, b) => a.localeCompare(b)),
    [turnos]
  );

  const filteredTurnos = useMemo(
    () =>
      selectedEfector === 'ALL'
        ? turnos
        : turnos.filter(t => t.efector === selectedEfector),
    [turnos, selectedEfector]
  );

  const fetchHistoricoByPacienteId = async (pacienteId: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getHistoricoTurno(pacienteId);
      setTurnos(Array.isArray(data) ? data : []);
      setSelectedEfector('ALL');
    } catch (e: any) {
      setError(e?.message ?? 'Error al consultar el histórico');
      setTurnos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeselect = () => {
    setPaciente(null);
    setFinishPaciente(false);
    setTurnos([]);
    setError(null);
    setSelectedEfector('ALL');
  };

  useEffect(() => {
    if (finishPaciente && paciente?.id) {
      fetchHistoricoByPacienteId(paciente.id);
    }
  }, [finishPaciente, paciente?.id]);

  return {
    turnos,
    loading,
    error,
    paciente,
    setPaciente,
    finishPaciente,
    setFinishPaciente,
    selectedEfector,
    setSelectedEfector,
    efectores,
    filteredTurnos,
    handleDeselect,
  };
}