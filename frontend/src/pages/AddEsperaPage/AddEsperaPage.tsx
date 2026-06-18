import { Box, Typography, Button, CircularProgress, Divider } from "@mui/material";
import { AlertMessage } from "../../common/components";
import { TarjetaPrioridad } from "./components/TarjetaPrioridad";
import { TarjetaEfector } from "./components/TarjetaEfector";
import { TarjetaPaciente } from "./components/TarjetaPaciente";
import { TarjetaProfesional } from "./components/TarjetaProfesional";
import { TarjetaEfeSerEsp } from "./components/TarjetaEfeSerEsp";
import { TarjetaEstudio } from "./components/TarjetaEstudio";
import { useAddEspera } from "./useAddEspera";
import { canSelectPriority, canConfirm } from "./utilsAddEspera";
import { useEfectorIdFromUrl } from "@/features/efector/utils/getUrl";

export default function AddEspera(): React.ReactElement {

  const efectorId = useEfectorIdFromUrl()   // pequeño helper para leer query/state
  const {
    efector, loadingEfector, errorEfector,
    paciente, setPaciente, finishPaciente, setFinishPaciente, resetPaciente,
    profesional, setProfesional, finishProfesional, setFinishProfesional, resetProfesional,
    efeSerEspSeleccionado, setEfeSerEspSeleccionado, finishEfeSerEsp, setFinishEfeSerEsp, resetEfeSerEsp,
    setCupo,
    estudioRequerido, setEstudioRequerido, finishEstudioRequerido, setFinishEstudioRequerido, resetEstudioRequerido,
    priority, setPriority,
    alert, setAlert,
    submitting, showRepeatOptions,
    handleConfirm, resetForRepeat,
    navigate,
  } = useAddEspera(efectorId);

  const selectPriority = canSelectPriority(efector, efectorId, paciente, profesional, efeSerEspSeleccionado, finishEstudioRequerido);
  const confirm = canConfirm(efector, efectorId, paciente, profesional, efeSerEspSeleccionado, priority);

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

      {finishPaciente && efectorId && (
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

      {selectPriority && (
        <TarjetaPrioridad
          canSelectPriority={selectPriority}
          priority={priority}
          setPriority={setPriority}
        />
      )}

      {/* ── Botones de acción ─────────────────────────────────────── */}
      {confirm && (
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
        open={alert.open}
        handleClose={() => setAlert(a => ({...a, open: false}))} 
        message={alert.msg}
        severity={alert.severity}/>
    </Box>
  );
}