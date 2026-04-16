import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Typography, Button, CircularProgress, Divider } from "@mui/material";
import { postTurnoEspera } from "../../features/turno_espera/api";

import type { Efector, EfeSerEspCompleto } from "../../features/efector/types";
import { getEfectorById } from "../../features/efector/api";
import type { Paciente, Profesional } from "../../features/persona/types";
import type { EstudioRequerido } from "../../features/turno_espera/types";
import { AlertMessage } from "../../common/components";
import { TarjetaPrioridad } from "./components/TarjetaPrioridad";
import { TarjetaEfector } from "./components/TarjetaEfector";
import { TarjetaPaciente } from "./components/TarjetaPaciente";
import { TarjetaProfesional } from "./components/TarjetaProfesional";
import { TarjetaEfeSerEsp } from "./components/TarjetaEfeSerEsp";
import { TarjetaEstudio } from "./components/TarjetaEstudio";

type AlertSeverity = "success" | "info" | "warning" | "error";

export default function AddEspera(): React.ReactElement {
  const location = useLocation();
  const navigate = useNavigate();

  const search = new URLSearchParams(location.search);
  const efQuery = search.get("efector");
  const stateEf = (location.state as number) ?? undefined;
  const efectorId = efQuery ? Number(efQuery) : stateEf ?? null;
  const [efector, setEfector] = useState<Efector | null>(null);
  const [loadingEfector, setLoadingEfector] = useState(false);
  const [errorEfector, setErrorEfector] = useState<string | null>(null);

  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [finishPaciente, setFinishPaciente] = useState(false);

  const [profesional, setProfesional] = useState<Profesional | null>(null);
  const [finishProfesional, setFinishProfesional] = useState(false);

  const [efeSerEspSeleccionado, setEfeSerEspSeleccionado] = useState<EfeSerEspCompleto | null>(null);
  const [finishEfeSerEsp, setFinishEfeSerEsp] = useState(false);

  const [cupo, setCupo] = useState(false);

  const [estudioRequerido, setEstudioRequerido] = useState<EstudioRequerido[]>([]);
  const [finishEstudioRequerido, setFinishEstudioRequerido] = useState(false);

  const [priority, setPriority] = useState<string | null>(null);

  const mapPriority: Record<string, number> = { baja: 2, media: 1, alta: 0 };

  const [alertOpen, setAlertOpen] = useState<boolean>(false);
  const [alertMsg, setAlertMsg] = useState<string>("");
  const [alertSeverity, setAlertSeverity] = useState<AlertSeverity>("info");

  const [submitting, setSubmitting] = useState<boolean>(false);

  const [showRepeatOptions, setShowRepeatOptions] = useState(false);

  useEffect(() => {
    if (efectorId == null) {
      setEfector(null);
      return;
    }
    let mounted = true;
    const load = async () => {
      setLoadingEfector(true);
      setErrorEfector(null);
      try {
        const data = await getEfectorById(efectorId);
        if (!mounted) return;
        setEfector(data);
      } catch (e: unknown) {
        const msg = (e as { message?: string })?.message ?? "Error al cargar efector";
        if (!mounted) return;
        setErrorEfector(msg);
        setEfector(null);
        setAlertMsg(msg);
        setAlertSeverity("error");
        setAlertOpen(true);
      } finally {
        if (mounted) setLoadingEfector(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [efectorId]);

  const resetPaciente = () => {
    setPaciente(null);
    setFinishPaciente(false);
    setPriority(null);
  };

  const resetProfesional = () => {
    setProfesional(null);
    setFinishProfesional(false);
    setPriority(null);
  };

  const resetEfeSerEsp = () => {
    setEfeSerEspSeleccionado(null);
    setFinishEfeSerEsp(false);
    setPriority(null);
    setEstudioRequerido([]);
    setFinishEstudioRequerido(false);
  };

  const resetEstudioRequerido = () => {
    setEstudioRequerido([]);
    setFinishEstudioRequerido(false);
    setPriority(null);
  };

  // Reset parcial conservando paciente y profesional ──────
  const resetForRepeat = () => {
    setEfeSerEspSeleccionado(null);
    setFinishEfeSerEsp(false);
    setEstudioRequerido([]);
    setFinishEstudioRequerido(false);
    setPriority(null);
    setCupo(false);
    setShowRepeatOptions(false);
  };
  // ────────────────────────────────────────────────────────────────

  const canSelectPriority = Boolean(
    (efector || efectorId) &&
      paciente &&
      profesional &&
      efeSerEspSeleccionado &&
      finishEstudioRequerido
  );

  useEffect(() => {
    if (!canSelectPriority) setPriority(null);
  }, [canSelectPriority]);

  const canConfirm = Boolean(
    (efector || efectorId) &&
      paciente &&
      profesional &&
      efeSerEspSeleccionado &&
      priority
  );

  const handleConfirm = async () => {
    if (!canConfirm || submitting) return;
    setSubmitting(true);
    try {
      const idEfeSerEsp = efeSerEspSeleccionado!.id;
      const idProf = profesional!.id;
      const idEfeSolicitante = efector ? efector.id : efectorId;
      const prioridadNum = mapPriority[priority!];
      const idPaciente = paciente!.id;
      const idsEstudios = estudioRequerido.map(e => e.id);

      await postTurnoEspera(idEfeSerEsp, idProf, idEfeSolicitante, idPaciente, idsEstudios, prioridadNum, cupo);

      setAlertMsg("Turno en espera creado correctamente.");
      setAlertSeverity("success");
      setAlertOpen(true);

      // Mostrar opciones en lugar de navegar automáticamente
      setSubmitting(false);
      setShowRepeatOptions(true);
      // ────────────────────────────────────────────────────────────
    } catch (err: unknown) {
      console.error("Error creando turno en espera:", err);
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        (err as { message?: string })?.message ||
        "Error al crear turno en espera";
      setAlertMsg(msg);
      setAlertSeverity("error");
      setAlertOpen(true);
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: "auto", position: "relative" }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5">Agregar a espera</Typography>
      </Box>

      <TarjetaEfector
        loadingEfector={loadingEfector}
        efector={efector}
        errorEfector={errorEfector}
      />

      <Divider sx={{ mb: 2 }} />

      <TarjetaPaciente
        paciente={paciente}
        setPaciente={setPaciente}
        finishPaciente={finishPaciente}
        setFinishPaciente={setFinishPaciente}
        resetPaciente={resetPaciente}
      />

      {finishPaciente && (
        <TarjetaProfesional
          efectorId={efectorId}
          profesional={profesional}
          setProfesional={setProfesional}
          finishProfesional={finishProfesional}
          setFinishProfesional={setFinishProfesional}
          resetProfesional={resetProfesional}
        />
      )}

      {efector && finishProfesional && (
        <TarjetaEfeSerEsp
          efector={efector}
          efeSerEspSeleccionado={efeSerEspSeleccionado}
          setEfeSerEspSeleccionado={setEfeSerEspSeleccionado}
          finishEfeSerEsp={finishEfeSerEsp}
          setFinishEfeSerEsp={setFinishEfeSerEsp}
          resetEfeSerEsp={resetEfeSerEsp}
          setCupo={setCupo}
        />
      )}

      {finishEfeSerEsp && (
        <TarjetaEstudio
          estudioRequerido={estudioRequerido}
          setEstudioRequerido={setEstudioRequerido}
          finishEstudioRequerido={finishEstudioRequerido}
          setFinishEstudioRequerido={setFinishEstudioRequerido}
          resetEstudioRequerido={resetEstudioRequerido}
        />
      )}

      <Divider sx={{ my: 2 }} />

      {canSelectPriority && (
        <TarjetaPrioridad
          canSelectPriority={canSelectPriority}
          priority={priority}
          setPriority={setPriority}
        />
      )}

      {/* ── Botones de acción ─────────────────────────────────────── */}
      {canSelectPriority && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 1 }}>
          {showRepeatOptions ? (
            <>
              <Button variant="outlined" onClick={() => navigate('/espera')}>
                Finalizar
              </Button>
              <Button variant="contained" onClick={resetForRepeat}>
                Agregar otro
              </Button>
            </>
          ) : (
            <Button
              variant="contained"
              onClick={handleConfirm}
              disabled={!canConfirm || submitting}
              aria-disabled={!canConfirm || submitting}
              startIcon={submitting ? <CircularProgress size={16} /> : undefined}
            >
              {submitting ? "Enviando..." : "Confirmar"}
            </Button>
          )}
        </Box>
      )}
      {/* ──────────────────────────────────────────────────────────── */}

      <AlertMessage
        open={alertOpen}
        handleClose={() => setAlertOpen(false)}
        message={alertMsg}
        severity={alertSeverity}
      />
    </Box>
  );
}