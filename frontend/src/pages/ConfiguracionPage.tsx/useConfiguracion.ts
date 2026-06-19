import { useContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { AuthContext } from '@/common/contex';
import { getServiciosByEfector } from '@/features/efector/api';
import type { Efector, Servicio } from '@/features/efector/types';
import type { AlertSeverity } from '@/common/types';
import type { EfeSerEspPlantillaExtend } from '@/features/mensaje/types';
import { hasConfiguracion } from '@/common/utils/permissions';
import {
  mergeServiciosUnique,
  addEfectorToServicios,
  removeEfectorFromServicios,
} from './utilsConfiguracion';

// ---------------------- Tipos ----------------------
export type ConfirmField = 'asignacion' | 'reprogramacion' | 'cancelacion' | 'recordatorio';

// ---------------------- Hook ----------------------
export function useConfiguracion() {
  const { efectores, groups } = useContext(AuthContext);
  const navigate = useNavigate();

  // --- Selección ---
  const [efectorSeleccionado,  setEfectorSeleccionado]  = useState<Efector[]>([]);
  const [servicios,            setServicios]            = useState<Servicio[]>([]);
  const [servicioSeleccionado, setServicioSeleccionado] = useState<Servicio[]>([]);
  const [especialidades,       setEspecialidades]       = useState<EfeSerEspPlantillaExtend[]>([]);
  const [servicioEfectorActual, setServicioEfectorActual] = useState<Record<number, number[]>>({});

  // --- Cache ---
  const [efectorServicios,       setEfectorServicios]       = useState<Record<number, Servicio[]>>({});
  const [efecServEspecialidades, setEfecServEspecialidades] = useState<Record<number, Record<number, EfeSerEspPlantillaExtend[]>>>({});

  // --- Diálogo / confirmación ---
  const [open,                 setOpen]                 = useState(false);
  const [confirmEspecialidades, setConfirmEspecialidades] = useState<EfeSerEspPlantillaExtend[]>([]);
  const [confirmField,         setConfirmField]         = useState<ConfirmField>('asignacion');
  const [confirmValue,         setConfirmValue]         = useState<0 | 1>(1);

  // --- Alertas ---
  const [alertOpen,     setAlertOpen]     = useState(false);
  const [alertMsg,      setAlertMsg]      = useState('');
  const [alertSeverity, setAlertSeverity] = useState<AlertSeverity>('info');

  const closeAlert = useCallback(() => setAlertOpen(false), []);
  const permiso = hasConfiguracion(groups)

  // --- Efector click ---
  const handleEfectorClick = useCallback(async (efector: Efector) => {
    const isSelected = efectorSeleccionado.some(e => e.id === efector.id);

    if (isSelected) {
      setEfectorSeleccionado(prev => prev.filter(e => e.id !== efector.id));

      const servToEf = efectorServicios[efector.id] ?? [];

      setServicioEfectorActual(prev => {
        const nextMap = removeEfectorFromServicios(prev, servToEf, efector.id);
        const idsConEfector = new Set(Object.keys(nextMap).map(Number));

        // Limpiamos servicios y selección que quedaron huérfanos
        setServicios(sp => sp.filter(s => idsConEfector.has(s.id)));
        setServicioSeleccionado(sp => sp.filter(s => idsConEfector.has(s.id)));

        return nextMap;
      });

      setEspecialidades(prev => prev.filter(es => es.id_efector !== efector.id));
      return;
    }

    // Seleccionar: usar cache o hacer fetch
    setEfectorSeleccionado(prev => [...prev, efector]);

    const cached = efectorServicios[efector.id];
    if (cached?.length) {
      setServicios(prev => mergeServiciosUnique(prev, cached));
      setServicioEfectorActual(prev => addEfectorToServicios(prev, cached, efector.id));
      return;
    }

    try {
      const data = await getServiciosByEfector([efector.id]);
      setEfectorServicios(prev => ({ ...prev, [efector.id]: data }));
      setServicios(prev => mergeServiciosUnique(prev, data));
      setServicioEfectorActual(prev => addEfectorToServicios(prev, data, efector.id));
    } catch (err) {
      console.error(err);
      setAlertMsg('No se pudieron cargar los servicios');
      setAlertSeverity('error');
      setAlertOpen(true);
    }
  }, [efectorSeleccionado, efectorServicios]);

  const navigateToPlantillas = useCallback(() => navigate('/plantillas'), [navigate]);

  return {
    efectores,
    permiso,
    efectorSeleccionado,
    servicios,
    servicioSeleccionado,
    setServicioSeleccionado,
    especialidades,
    setEspecialidades,
    servicioEfectorActual,
    setServicioEfectorActual,
    efecServEspecialidades,
    setEfecServEspecialidades,
    open,
    setOpen,
    confirmEspecialidades,
    setConfirmEspecialidades,
    confirmField,
    setConfirmField,
    confirmValue,
    setConfirmValue,
    alertOpen,
    alertMsg,
    alertSeverity,
    setAlertOpen,
    setAlertMsg,
    setAlertSeverity,
    closeAlert,
    handleEfectorClick,
    navigateToPlantillas,
  };
}