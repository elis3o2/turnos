import { useEffect, useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { Paciente } from "../../types";
import { getPacienteByDNI } from "../../api";
import { parsePacientesResponse } from "./utilsLookPaciente";

interface LookPacienteProps {
  paciente: Paciente | null;
  setPaciente: (paciente: Paciente | null) => void;
  setFinishPaciente: Dispatch<SetStateAction<boolean>>;
}

export function useLookPaciente({
  paciente,
  setPaciente,
  setFinishPaciente,
}: LookPacienteProps) {
  const [dni, setDni] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [selectedPacienteId, setSelectedPacienteId] = useState<number | string | null>(null);

  useEffect(() => {
    if (paciente) {
      setSelectedPacienteId(String(paciente.id));
    }
  }, [paciente]);

  const handleBuscar = async () => {
    setError(null);
    setPacientes([]);
    setSelectedPacienteId(null);

    const doc = dni.trim();
    if (!doc) {
      setError("Ingresá un DNI válido.");
      return;
    }

    setLoading(true);
    try {
      const data = await getPacienteByDNI(doc);
      const list = parsePacientesResponse(data);

      if (list.length === 0) {
        setError("No se encontraron pacientes para ese DNI.");
      }

      setPacientes(list);
    } catch (e: unknown) {
      const err = e as {
        response?: { data?: { detail?: string } | string };
        message?: string;
      };

      const msg =
        err?.response?.data ??
        err?.message ??
        "Error al consultar pacientes.";

      setError(String(msg));
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPaciente = (id: number | string) => {
    setSelectedPacienteId(id);
    const p = pacientes.find((x) => String(x.id) === String(id)) ?? null;
    setPaciente(p);
  };

  const pacienteSeleccionado = useMemo(() => {
    return (
      pacientes.find((p) => String(p.id) === String(selectedPacienteId)) ??
      paciente ??
      null
    );
  }, [pacientes, selectedPacienteId, paciente]);

  const handleConfirmar = () => {
    setPaciente(pacienteSeleccionado);
    setFinishPaciente(true);
  };

  const handleLimpiar = () => {
    setSelectedPacienteId(null);
    setPaciente(null);
  };

  return {
    dni,
    setDni,
    loading,
    error,
    pacientes,
    selectedPacienteId,
    handleBuscar,
    handleSelectPaciente,
    pacienteSeleccionado,
    handleConfirmar,
    handleLimpiar,
  };
}