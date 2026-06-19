import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "@/common/contex";
import type { Efector } from "@/features/efector/types";
import type { EstudioRequerido, TurnoEspera } from "@/features/turno_espera/types";
import {
  getTurnoEsperaAbierto,
  getTurnoEsperaAbiertoDeriva,
  postMarcarEstudiosTurno,
  CloseTurnoEspera,
} from "@/features/turno_espera/api";
import { getDerivaByEfector } from "@/features/efector/api";
import { hasEspera } from "@/common/utils/permissions";
import {
    applyEstudiosToTurnos,
    buildEspecialidadesOptions,
    filterAndSortTurnos,
    getErrorMessage,
    getSelectedEstudiosFromTurno,
    getUniqueDerivaciones,
    type AlertSeverity,
    type SortBy
 } from "./utilsListaEspra";

export function useListaEspera() {
  const { efectores, groups } = useContext(AuthContext) as { efectores: Efector[], groups: string[] };
  const navigate = useNavigate();

  const [selectedEfector, setSelectedEfector] = useState<Efector | null>(null);
  const [selectedEspecialidad, setSelectedEspecialidad] = useState<number | null>(null);

  const [turnos, setTurnos] = useState<TurnoEspera[]>([]);
  const [loading, setLoading] = useState(false);

  const [derivaciones, setDerivaciones] = useState<Efector[]>([]);
  const [selectedDerivacion, setSelectedDerivacion] = useState<Efector | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>("priority");

  const [openDialog, setOpenDialog] = useState(false);
  const [activeTurno, setActiveTurno] = useState<TurnoEspera | null>(null);
  const [removingIds, setRemovingIds] = useState<number[]>([]);
  const [selectedEstudios, setSelectedEstudios] = useState<number[]>([]);

  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [alertSeverity, setAlertSeverity] = useState<AlertSeverity>("info");

  const permiso = hasEspera(groups)
  
  useEffect(() => {
    if (!selectedEfector) {
      setTurnos([]);
      return;
    }

    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        const data = selectedDerivacion
          ? await getTurnoEsperaAbiertoDeriva(selectedDerivacion.id, selectedEfector.id)
          : await getTurnoEsperaAbierto(selectedEfector.id);

        if (mounted) setTurnos(data);
      } catch (e: unknown) {
        if (!mounted) return;
        setAlertMsg(getErrorMessage(e, "Error al obtener turnos"));
        setAlertSeverity("error");
        setAlertOpen(true);
        setTurnos([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [selectedEfector, selectedDerivacion]);

  useEffect(() => {
    setSelectedEspecialidad(null);
    setSortBy("priority");
  }, [selectedEfector]);

  useEffect(() => {
    if (!selectedEfector) {
      setDerivaciones([]);
      setSelectedDerivacion(null);
      return;
    }

    const loadDerivaciones = async () => {
      try {
        const data = await getDerivaByEfector(selectedEfector.id);
        const unicos = getUniqueDerivaciones(data);

        setDerivaciones(unicos);
        setSelectedDerivacion((current) => {
          if (!current) return null;
          return unicos.some((d) => d.id === current.id) ? current : null;
        });
      } catch (e: unknown) {
        setAlertMsg(getErrorMessage(e, "Error al obtener derivaciones"));
        setAlertSeverity("error");
        setAlertOpen(true);
      }
    };

    loadDerivaciones();
  }, [selectedEfector]);

  useEffect(() => {
    setSelectedEstudios(getSelectedEstudiosFromTurno(activeTurno));
  }, [activeTurno]);

  const especialidadesOptions = useMemo(
    () => buildEspecialidadesOptions(turnos),
    [turnos]
  );

  useEffect(() => {
    if (
      selectedEspecialidad !== null &&
      !especialidadesOptions.some((s) => s.id === selectedEspecialidad)
    ) {
      setSelectedEspecialidad(null);
    }
  }, [especialidadesOptions, selectedEspecialidad]);

  const visibleTurnos = useMemo(
    () => filterAndSortTurnos(turnos, selectedEspecialidad, sortBy),
    [turnos, selectedEspecialidad, sortBy]
  );

  const isRemoving = (id?: number | null) => id != null && removingIds.includes(id);

  const handleToggleEstudio = (estudio: EstudioRequerido) => {
    if (estudio.estado) return;

    setSelectedEstudios((prev) =>
      prev.includes(estudio.id)
        ? prev.filter((id) => id !== estudio.id)
        : [...prev, estudio.id]
    );
  };

  const handleGuardarEstudios = async () => {
    if (!activeTurno) return;

    try {
      setLoading(true);

      const res = await postMarcarEstudiosTurno(
        activeTurno.id,
        selectedEstudios
      );

      setTurnos((prev) =>
        applyEstudiosToTurnos(prev, activeTurno.id, res.estudios)
      );

      setAlertMsg(`Se marcaron ${res.actualizados} estudio(s)`);
      setAlertSeverity("success");
      setAlertOpen(true);
      handleCloseDialog();
    } catch (e: unknown) {
      setAlertMsg(getErrorMessage(e, "Error al marcar estudios"));
      setAlertSeverity("error");
      setAlertOpen(true);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (t: TurnoEspera) => {
    setActiveTurno(t);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setActiveTurno(null);
  };

  const handleRemove = async () => {
    if (!activeTurno) return;

    const id = activeTurno.id;
    setRemovingIds((prev) => (prev.includes(id) ? prev : [...prev, id]));

    try {
      await CloseTurnoEspera(id);
      setTurnos((prev) => prev.filter((t) => t.id !== id));
      setAlertMsg("Turno sacado de la lista de espera.");
      setAlertSeverity("success");
      setAlertOpen(true);
    } catch (e: unknown) {
      setAlertMsg(getErrorMessage(e, "Error al sacar el turno."));
      setAlertSeverity("error");
      setAlertOpen(true);
    } finally {
      setRemovingIds((prev) => prev.filter((x) => x !== id));
      handleCloseDialog();
    }
  };

  const handleGoToAddEspera = () => {
    if (!selectedEfector) return;
    navigate(`/add-espera?efector=${selectedEfector.id}`);
  };

  const handleGoToBuscarPaciente = () => {
    navigate("/espera-paciente");
  };

  return {
    efectores,
    permiso,
    selectedEfector,
    setSelectedEfector,
    selectedEspecialidad,
    setSelectedEspecialidad,
    turnos,
    loading,
    derivaciones,
    selectedDerivacion,
    setSelectedDerivacion,
    sortBy,
    setSortBy,
    openDialog,
    activeTurno,
    removingIds,
    selectedEstudios,
    alertOpen,
    setAlertOpen,
    alertMsg,
    alertSeverity,
    especialidadesOptions,
    visibleTurnos,
    isRemoving,
    handleToggleEstudio,
    handleGuardarEstudios,
    handleOpenDialog,
    handleCloseDialog,
    handleRemove,
    handleGoToAddEspera,
    handleGoToBuscarPaciente,
  };
}