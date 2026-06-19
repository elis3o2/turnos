import { useState, useEffect, useCallback } from "react";
import { getSerEspByEfector, getIdByEfeSerEsp, getDerivaByEfector } from "../../api";
import type {
  Efector,
  Servicio,
  Especialidad,
  EfeSerEspCompleto,
  SerEsp,
  Deriva
} from "../../types";
import { sortByNombre, mergeById } from "@/common/utils/collections";

import { buildServiciosUnificados, toEspecialidad } from "./utilsLookEfeSerEsp";
import type { Setter } from "@/common/types";

// ─── HOOK PRINCIPAL ──────────────────────────────────────────────────────

interface UseLookEfeSerEspProps {
  efector: Efector;
  setCupo:  Setter<boolean>;
  setEfeSerEspSeleccionado: Setter<EfeSerEspCompleto | null>;
  setFinishEfeSerEsp: (val: boolean) => void;
}

export const useLookEfeSerEsp = ({
  efector,
  setCupo,
  setEfeSerEspSeleccionado,
  setFinishEfeSerEsp,
}: UseLookEfeSerEspProps) => {
  // Datos crudos
  const [serEsp, setSerEsp] = useState<SerEsp[]>([]);
  const [derivaciones, setDerivaciones] = useState<Deriva[]>([]);

  // Opciones de Selects
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [efectores, setEfectores] = useState<Efector[]>([]);

  // Selecciones
  const [selectedServicio, setSelectedServicio] = useState<Servicio | null>(null);
  const [selectedEspecialidad, setSelectedEspecialidad] = useState<Especialidad | null>(null);
  const [selectedEfector, setSelectedEfector] = useState<Efector | null>(null);

  // UI Status
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 1. Carga inicial de datos
  useEffect(() => {
    let mounted = true;
    const cargarDatos = async () => {
      setLoading(true);
      setError(null);
      try {
        const [sres, dres] = await Promise.all([
          getSerEspByEfector(efector.id),
          getDerivaByEfector(efector.id),
        ]);
        if (!mounted) return;

        const resSerEsp = sres ?? [];
        const resDeriva = dres ?? [];
        setSerEsp(resSerEsp);
        setDerivaciones(resDeriva);
        setServicios(buildServiciosUnificados(resSerEsp, resDeriva));
      } catch (e: any) {
        if (mounted) setError(e?.response?.data ?? e?.message ?? "Error de carga");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    cargarDatos();
    return () => { mounted = false; };
  }, [efector.id]);

  // 2. Lógica de Cascada: Servicio -> Especialidad
  useEffect(() => {
    if (!selectedServicio) {
      resetChildren();
      return;
    }

    const serespEntry = serEsp.find((s) => s.id_ser === selectedServicio.id);
    const derivsServicio = derivaciones.filter(d => d.servicio_deriva?.id === selectedServicio.id);

    // Build especialidades
    const epsSerEsp = (serespEntry?.especialidades ?? []).map(toEspecialidad);
    const epsDeriv = derivsServicio.map(d => d.especialidad_deriva).filter(Boolean) as Especialidad[];
    setEspecialidades(sortByNombre(mergeById(epsSerEsp, epsDeriv)));
    
    // Build efectores iniciales (el propio + derivaciones)
    const efs: Efector[] = [efector];
    derivsServicio.forEach(d => {
      if (d.efector_deriva && !efs.some(e => e.id === d.efector_deriva.id)) efs.push(d.efector_deriva);
    });

    setEfectores(efs);
    setSelectedEfector(efector);
    setSelectedEspecialidad(null);
  }, [selectedServicio, serEsp, derivaciones, efector]);

  // 3. Lógica de Cascada: Especialidad -> Efectores/Cupo
  useEffect(() => {
    if (!selectedServicio || !selectedEspecialidad) return;

    const derivsExactas = derivaciones.filter(
      (d) => d.servicio_deriva?.id === selectedServicio.id && 
             d.especialidad_deriva?.id === selectedEspecialidad.id
    );

    if (derivsExactas.length > 0) {
      const efsDeriv = Array.from(new Map(derivsExactas.map(d => [d.efector_deriva.id, d.efector_deriva])).values());
      setEfectores(efsDeriv);
      setSelectedEfector(efsDeriv[0] ?? null);
      setCupo(Number(derivsExactas[0].cupo) === 1);
    } else {
      const enSerEsp = serEsp.some((s) => s.id_ser === selectedServicio.id);
      setEfectores(enSerEsp ? [efector] : []);
      setSelectedEfector(enSerEsp ? efector : null);
      setCupo(false);
    }
  }, [selectedEspecialidad, selectedServicio, derivaciones, serEsp, efector, setCupo]);

  // Acciones
  const resetChildren = () => {
    setEspecialidades([]);
    setSelectedEspecialidad(null);
    setEfectores([]);
    setSelectedEfector(null);
    setCupo(false);
  };

  const handleClear = useCallback(() => {
    setSelectedServicio(null);
    setEfeSerEspSeleccionado(null);
    setFinishEfeSerEsp(false);
    setError(null);
    resetChildren();
  }, [setEfeSerEspSeleccionado, setFinishEfeSerEsp]);

  const handleConfirm = async () => {
    if (!selectedEfector || !selectedServicio || !selectedEspecialidad) {
      setError("Faltan campos por seleccionar.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await getIdByEfeSerEsp(selectedEfector.id, selectedServicio.id, selectedEspecialidad.id);
      setEfeSerEspSeleccionado(res);
      setFinishEfeSerEsp(true);
    } catch (e: any) {
      setError(e?.response?.data ?? e?.message ?? "Error al confirmar");
    } finally {
      setLoading(false);
    }
  };

  return {
      servicios,
      especialidades,
      efectores,
      selectedServicio,
      selectedEspecialidad,
      selectedEfector,
      loading,
      error,
      setSelectedServicio,
      setSelectedEspecialidad,
      setSelectedEfector,
      handleConfirm,
      handleClear,
  };
};