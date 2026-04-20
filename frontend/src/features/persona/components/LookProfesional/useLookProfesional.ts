import { useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { getProfesionalByEfector } from "../../api";
import type { Profesional } from "../../types";
import { getErrorMessage, parseProfesionalesResponse } from "./utilsLookProfesional";

interface UseLookProfesionalProps {
  efectorId: number;
  selectedProfesional: Profesional | null;
  setProfesional: (p: Profesional | null) => void;
  setFinishProfesional: Dispatch<SetStateAction<boolean>>;
}

export function useLookProfesional({
  efectorId,
  selectedProfesional,
  setProfesional,
  setFinishProfesional,
}: UseLookProfesionalProps) {
  const [nombre, setNombre] = useState<string>("");
  const [apellido, setApellido] = useState<string>("");

  const [profesionales, setProfesionales] = useState<Profesional[]>([]);
  const [selectedProfesionalId, setSelectedProfesionalId] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const profesionalSeleccionado = useMemo(() => {
    return (
      profesionales.find((p) => String(p.id) === String(selectedProfesionalId)) ??
      selectedProfesional ??
      null
    );
  }, [profesionales, selectedProfesionalId, selectedProfesional]);

  const handleBuscar = async () => {
    if (!efectorId) {
      setError("Debes seleccionar un efector primero.");
      return;
    }

    setError(null);
    setProfesionales([]);
    setProfesional(null);
    setSelectedProfesionalId("");
    setFinishProfesional(false);
    setLoading(true);

    try {
      const data = await getProfesionalByEfector(
        efectorId,
        nombre || null,
        apellido || null
      );

      const list = parseProfesionalesResponse(data);

      if (list.length === 0) {
        setError("No se encontraron profesionales.");
      }

      setProfesionales(list);
    } catch (e: unknown) {
      setError(getErrorMessage(e, "Error al consultar profesionales."));
    } finally {
      setLoading(false);
    }
  };

  const handleRadioChange = (val: string) => {
    setSelectedProfesionalId(val);
    const prof = profesionales.find((p) => String(p.id) === String(val)) ?? null;
    setProfesional(prof);
    setFinishProfesional(false);
  };

  const handleConfirm = () => {
    if (!selectedProfesional && selectedProfesionalId) {
      const prof =
        profesionales.find((p) => String(p.id) === String(selectedProfesionalId)) ?? null;
      setProfesional(prof);
    }

    setFinishProfesional(true);
  };

  const handleClear = () => {
    setSelectedProfesionalId("");
    setProfesional(null);
    setFinishProfesional(false);
  };

  return {
    nombre,
    setNombre,
    apellido,
    setApellido,
    profesionales,
    selectedProfesionalId,
    loading,
    error,
    profesionalSeleccionado,
    handleBuscar,
    handleRadioChange,
    handleConfirm,
    handleClear,
  };
}