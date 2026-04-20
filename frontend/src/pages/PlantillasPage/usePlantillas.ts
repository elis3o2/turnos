import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';

import { getPlantillas, getPlantillaByTipo, updateEfectorPlantilla } from '../../features/mensaje/api';
import type { Plantilla } from '../../features/mensaje/types';

import {
  TIPO_TO_ID,
  groupPlantillasByType,
  validateDiasAntes,
  buildPlantillaPayload,
  type AlertSeverity,
  type StateShape
} from "./utilsPlantillas"


// ---------------------- Hook ----------------------
export function usePlantillas() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { tipo }  = useParams<{ tipo?: string }>();

  const state             = (location.state as StateShape) ?? {};
  const especialidadesIds = state.especialidades ?? [];
  const isModificationMode = Boolean(tipo) && especialidadesIds.length > 0;

  // --- Datos ---
  const [plantillas, setPlantillas] = useState<Plantilla[]>([]);
  const [loading,    setLoading]    = useState(false);
  const [updating,   setUpdating]   = useState(false);
  const [diasAntes,  setDiasAntes]  = useState('');

  // --- Alerta ---
  const [alertOpen,     setAlertOpen]     = useState(false);
  const [alertMsg,      setAlertMsg]      = useState('');
  const [alertSeverity, setAlertSeverity] = useState<AlertSeverity>('info');

  const showAlert = useCallback((msg: string, severity: AlertSeverity = 'info') => {
    setAlertMsg(msg);
    setAlertSeverity(severity);
    setAlertOpen(true);
  }, []);

  const closeAlert = useCallback(() => setAlertOpen(false), []);

  // --- Fetch plantillas ---
  useEffect(() => {
    const fetchPlantillas = async () => {
      setLoading(true);
      try {
        const data = tipo
          ? await getPlantillaByTipo(TIPO_TO_ID[tipo] ?? 4)
          : await getPlantillas();
        setPlantillas(data);
      } catch (err) {
        console.error('Error cargando plantillas:', err);
        showAlert('Error cargando plantillas. Revise la consola.', 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchPlantillas();
  }, [tipo, showAlert]);

  // --- Agrupado memoizado ---
  const grouped = useMemo(() => groupPlantillasByType(plantillas), [plantillas]);

  // --- Asignar plantilla ---
  const handleCardAssign = useCallback(async (plantillaId: number) => {
    if (!tipo || especialidadesIds.length === 0) {
      showAlert('No está en modo de modificación o no hay especialidades seleccionadas.', 'warning');
      return;
    }

    if (tipo === 'recordatorio') {
      const validationError = validateDiasAntes(diasAntes);
      if (validationError) {
        showAlert(validationError, 'warning');
        return;
      }
    }

    const payload = buildPlantillaPayload(
      tipo,
      plantillaId,
      tipo === 'recordatorio' ? Number(diasAntes) : undefined,
    );

    setUpdating(true);
    try {
      await Promise.all(especialidadesIds.map(id => updateEfectorPlantilla(id, payload)));
      showAlert('Plantillas asignadas con éxito.', 'success');
      setTimeout(() => {
        setUpdating(false);
        navigate('/list');
      }, 2000);
    } catch (err) {
      console.error('Error actualizando plantilla:', err);
      showAlert('Ocurrió un error al actualizar. Revise la consola.', 'error');
      setUpdating(false);
    }
  }, [tipo, especialidadesIds, diasAntes, showAlert, navigate]);

  return {
    plantillas,
    grouped,
    loading,
    updating,
    tipo,
    isModificationMode,
    diasAntes,
    setDiasAntes,
    alertOpen,
    alertMsg,
    alertSeverity,
    closeAlert,
    handleCardAssign,
  };
}