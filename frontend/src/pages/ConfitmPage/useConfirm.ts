import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getTurnoPaciente, putTurnoPaciente } from "../../features/turno/api";
import type { TurnoPacienteResp } from "../../features/turno/types";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export function useConfirm() {
  const [datos, setDatos] = useState<TurnoPacienteResp | null>(null);
  const [respuesta, setRespuesta] = useState<string | null>(null);
  const [estado, setEstado] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const query = useQuery();
  const encodedId = query.get("id");

  useEffect(() => {
    async function fetchTurno() {
      if (!encodedId) return;

      try {
        const data = await getTurnoPaciente(encodedId);
        setEstado(data.estado_pac);
        setDatos(data);

        if (data.estado_pac === 1) setRespuesta("confirmado");
        if (data.estado_pac === 2) setRespuesta("rechazado");
        if (data.estado_pac === 3) setRespuesta("desconocido");
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }

    fetchTurno();
  }, [encodedId]);

  const actualizarEstado = async (nuevoEstado: number, mensaje: string) => {
    if (!encodedId) return;

    try {
      await putTurnoPaciente(encodedId, nuevoEstado);
      setRespuesta(mensaje);
      setEstado(nuevoEstado);
    } catch (e) {
      console.error(e);
    }
  };

  const turnoYaPaso = (() => {
    if (!datos?.fecha || !datos?.hora) return false;
    return new Date(`${datos.fecha}T${datos.hora}`) < new Date();
  })();

  return {
    datos,
    respuesta,
    estado,
    loading,
    turnoYaPaso,
    actualizarEstado,
  };
}