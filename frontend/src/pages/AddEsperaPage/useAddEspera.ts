import  { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Efector, EfeSerEspCompleto } from "@/features/efector/types";
import type { Paciente, Profesional } from "@/features/persona/types";
import type { Estudio } from "@/features/turno_espera/types";
import type { AlertSeverity } from "@/common/types";
import { getEfectorById } from "@/features/efector/api";
import { postTurnoEspera } from "@/features/turno_espera/api";
import { mapPriorityNameId } from "@/features/turno_espera/utils";

export function useAddEspera(efectorId: number | null) {
  const navigate = useNavigate();

  const [efector, setEfector] = useState<Efector | null>(null);
  const [loadingEfector, setLoadingEfector] = useState(false);
  const [errorEfector, setErrorEfector] = useState<string | null>(null);

  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [finishPaciente, setFinishPaciente] = useState(false);

  const [profesional, setProfesional] = useState<Profesional | null>(null);
  const [finishProfesional, setFinishProfesional] = useState(false);

  const [profesionalDeriva, setProfesionalDeriva] = useState<Profesional | null>(null)
  const [finishProfesionalDeriva, setFinishProfesionalDeriva] = useState(false)

  const [efeSerEspSeleccionado, setEfeSerEspSeleccionado] = useState<EfeSerEspCompleto | null>(null);
  const [finishEfeSerEsp, setFinishEfeSerEsp] = useState(false);
  const [cupo, setCupo] = useState(false);

  const [estudioRequerido, setEstudioRequerido] = useState<Estudio[]>([]);
  const [finishEstudioRequerido, setFinishEstudioRequerido] = useState(false);

  const [priority, setPriority] = useState<string | null>(null);
  const [alert, setAlert] = useState({ open: false, msg: "", severity: "info" as AlertSeverity });
  const [submitting, setSubmitting] = useState(false);
  const [showRepeatOptions, setShowRepeatOptions] = useState(false);



  // ── Efecto de carga ──────────────────────────────────────────
  useEffect(() => {
    if (efectorId == null) { setEfector(null); return; }
    let mounted = true;
    const load = async () => {
      setLoadingEfector(true);
      setErrorEfector(null);
      try {
        const data = await getEfectorById(efectorId);
        if (mounted) setEfector(data);
      } catch (e: unknown) {
        const msg = (e as { message?: string })?.message ?? "Error al cargar efector";
        if (mounted) { setErrorEfector(msg); setEfector(null); }
      } finally {
        if (mounted) setLoadingEfector(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [efectorId]);

  // ── Resets ──────────────────────────────────────────────────
  const resetPaciente    = () => { setPaciente(null); setFinishPaciente(false); setPriority(null); };
  const resetProfesional = () => { setProfesional(null); setFinishProfesional(false); setPriority(null); };
  const resetEfeSerEsp   = () => { setEfeSerEspSeleccionado(null); setFinishEfeSerEsp(false); setPriority(null); setEstudioRequerido([]); setFinishEstudioRequerido(false); setProfesionalDeriva(null); setFinishProfesionalDeriva(false) };
  const resetProfesionalDeriva = () => { setProfesionalDeriva(null); setFinishProfesionalDeriva(false); setPriority(null); };
  const resetEstudioRequerido = () => { setEstudioRequerido([]); setFinishEstudioRequerido(false); setPriority(null); };
  const resetForRepeat   = () => { resetEfeSerEsp(); setCupo(false); setShowRepeatOptions(false); };

  // ── Submit ──────────────────────────────────────────────────
  const handleConfirm = async () => {
    if (submitting || !efeSerEspSeleccionado || !profesional || !efectorId || !paciente || !priority) return;
    setSubmitting(true);
    try {
      await postTurnoEspera(
        efeSerEspSeleccionado.id, profesional.id,
        profesionalDeriva ? profesionalDeriva.id : null,
        efector ? efector.id : efectorId,
        paciente.id, estudioRequerido.map(e => e.id),
        mapPriorityNameId[priority], cupo
      );
      setAlert({ open: true, msg: "Turno en espera creado correctamente.", severity: "success" });
      setShowRepeatOptions(true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
        ?? (err as { message?: string })?.message ?? "Error al crear turno en espera";
      setAlert({ open: true, msg, severity: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return {
    efector, loadingEfector, errorEfector,
    paciente, setPaciente, finishPaciente, setFinishPaciente, resetPaciente,
    profesional, setProfesional, finishProfesional, setFinishProfesional, resetProfesional,
    profesionalDeriva, setProfesionalDeriva, finishProfesionalDeriva, setFinishProfesionalDeriva, resetProfesionalDeriva,
    efeSerEspSeleccionado, setEfeSerEspSeleccionado, finishEfeSerEsp, setFinishEfeSerEsp, resetEfeSerEsp,
    setCupo,
    estudioRequerido, setEstudioRequerido, finishEstudioRequerido, setFinishEstudioRequerido, resetEstudioRequerido,
    priority, setPriority,
    alert, setAlert,
    submitting, showRepeatOptions,
    handleConfirm, resetForRepeat,
    navigate,
  };
}