import { useEffect, useMemo, useState } from "react";
import type { Paciente } from "../../types";
import { getPacienteByDNI } from "../../api";
import type { Setter } from "@/common/types";

interface Props {
  paciente: Paciente | null;
  setPaciente: Setter<Paciente | null>;
  setFinishPaciente: Setter<boolean>;
}

export function useLookPaciente({ paciente, setPaciente, setFinishPaciente }: Props) {
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

      if (data.length === 0) {
        setError("No se encontraron pacientes para ese DNI.");
      }

      setPacientes(data);
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