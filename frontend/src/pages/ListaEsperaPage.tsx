import { useContext, useEffect, useMemo, useState } from "react";
import type { Efector } from "../features/efector/types";
import type { EstudioRequerido, TurnoEspera } from "../features/turno_espera/types";
import { AuthContext } from "../common/contex";
import {
  getTurnoEsperaAbierto,
  getTurnoEsperaAbiertoDeriva,
  postMarcarEstudiosTurno,
  CloseTurnoEspera,
  getDerivaByEfector,
} from "../features/turno_espera/api";
import {
  Box, Select, MenuItem, FormControl, InputLabel, CircularProgress,
  Typography, Paper, Stack, Button, GridLegacy as Grid
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { AlertMessage } from "../common/components";
import DetalleTurno from "../features/turno_espera/components/DetalleTurno"
import { EfectorForm } from "../features/efector/components/EfectorForm";
import type { KeyNLabel } from "../common/types";
import ListaEsperaComponent from "../features/turno_espera/components/ListaEsperaComponent"
import type { SelectChangeEvent } from "@mui/material";
type SortBy = "priority" | "dias";
type AlertSeverity = "success" | "info" | "warning" | "error";

export default function ListaEspera(): React.ReactElement {
  const { efectores } = useContext(AuthContext) as { efectores: KeyNLabel[] };
  const [selectedEfector, setSelectedEfector] = useState<Efector | null>(null);
  const [selectedEspecialidad, setSelectedEspecialidad] = useState<number | null>(null);

  const [turnos, setTurnos] = useState<TurnoEspera[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
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

  // ── efectos ────────────────────────────────────────────────────────────────

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
      } catch (e: any) {
        if (!mounted) return;
        setAlertMsg(e?.message ?? "Error al obtener turnos");
        setAlertSeverity("error");
        setAlertOpen(true);
        setTurnos([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
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
        const únicos = Array.from(
          new Map(data.map((d) => [d.efector_deriva.id, d.efector_deriva])).values()
        );
        setDerivaciones(únicos);
      } catch (e: any) {
        setAlertMsg(e?.message ?? "Error al obtener derivaciones");
        setAlertSeverity("error");
        setAlertOpen(true);
      }
    };
    loadDerivaciones();
  }, [selectedEfector]);

  useEffect(() => {
    if (activeTurno?.estudio_requerido) {
      setSelectedEstudios(
        activeTurno.estudio_requerido.filter((e) => e.estado).map((e) => e.id)
      );
    } else {
      setSelectedEstudios([]);
    }
  }, [activeTurno]);

  // ── helpers ────────────────────────────────────────────────────────────────

  const isRemoving = (id?: number | null) =>
    id != null && removingIds.includes(id);


  // ── acciones ───────────────────────────────────────────────────────────────

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
      const res = await postMarcarEstudiosTurno(activeTurno.id, selectedEstudios);
      setTurnos((prev) =>
        prev.map((t) =>
          t.id === activeTurno.id
            ? {
                ...t,
                estudio_requerido: t.estudio_requerido.map((e) => {
                  const seleccionado = selectedEstudios.includes(e.id) && !e.estado;
                  return {
                    ...e,
                    estado: seleccionado ? true : e.estado,
                    fecha_cierre: seleccionado
                      ? new Date().toISOString()
                      : e.fecha_cierre,
                  };
                }),
              }
            : t
        )
      );
      setAlertMsg(`Se marcaron ${res.actualizados} estudio(s)`);
      setAlertSeverity("success");
      setAlertOpen(true);
      handleCloseDialog();
    } catch (e: any) {
      setAlertMsg(e?.message ?? "Error al marcar estudios");
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
      const msg = (e as { message?: string })?.message ?? "Error al sacar el turno.";
      setAlertMsg(msg);
      setAlertSeverity("error");
      setAlertOpen(true);
    } finally {
      setRemovingIds((prev) => prev.filter((x) => x !== id));
      handleCloseDialog();
    }
  };

  // ── derivados ──────────────────────────────────────────────────────────────

  const especialidadesOptions = useMemo(() => {
    const map = new Map<number, string>();
    for (const t of turnos) {
      if (!map.has(t.especialidad.id)) map.set(t.especialidad.id, t.especialidad.nombre);
    }
    return Array.from(map.entries()).map(([id, nombre]) => ({ id, nombre }));
  }, [turnos]);

  useEffect(() => {
    if (
      selectedEspecialidad !== null &&
      !especialidadesOptions.some((s) => s.id === selectedEspecialidad)
    ) {
      setSelectedEspecialidad(null);
    }
  }, [especialidadesOptions, selectedEspecialidad]);

  const visibleTurnos = useMemo(() => {
    let arr = [...turnos];

    if (selectedEspecialidad !== null) {
      arr = arr.filter((t) => t.especialidad.id === selectedEspecialidad);
    }

    if (sortBy === "priority") {
      arr.sort((a, b) => {
        const pa = a.prioridad ?? 99;
        const pb = b.prioridad ?? 99;

        if (pa !== pb) return pa - pb;

        // desempate por fecha (más viejo primero)
        return a.fecha_hora_creacion.localeCompare(b.fecha_hora_creacion);
      });
    } else {
      arr.sort((a, b) => {
        // más viejo primero = más días en espera
        if (a.fecha_hora_creacion !== b.fecha_hora_creacion) {
          return a.fecha_hora_creacion.localeCompare(b.fecha_hora_creacion);
        }

        // desempate por prioridad
        return (a.prioridad ?? 99) - (b.prioridad ?? 99);
      });
    }

    return arr;
  }, [turnos, selectedEspecialidad, sortBy]);
  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6">Lista de espera</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="contained" disableElevation
            onClick={() => navigate(`/add-espera?efector=${selectedEfector?.id}`)}
            disabled={!selectedEfector}
          >
            Agregar
          </Button>
          <Button variant="contained" disableElevation onClick={() => navigate(`/espera-paciente`)}>
            Buscar Paciente
          </Button>
        </Box>
      </Box>
      {/* Filtros */}
      <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Grid item xs={12} sm={4} md={3}>
          <EfectorForm
            efectores={efectores}
            selectedEfector={selectedEfector}
            setSelectedEfector={setSelectedEfector}>
          </EfectorForm>
        </Grid>

        <Grid item xs={12} sm={4} md={3}>
          <FormControl size="small" fullWidth>
            <InputLabel>Especialidad</InputLabel>
            <Select
              value={selectedEspecialidad ? String(selectedEspecialidad) : ""}
              label="Especialidad"
              onChange={(e: SelectChangeEvent) =>
                setSelectedEspecialidad(e.target.value === "" ? null : Number(e.target.value))
              }
            >
              <MenuItem value="">Todos</MenuItem>
              {especialidadesOptions.map((s) => (
                <MenuItem key={s.id} value={s.id}>{s.nombre}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <FormControl size="small" fullWidth>
            <InputLabel>Ordenar por</InputLabel>
            <Select
              value={sortBy}
              label="Ordenar por"
              onChange={(e) => setSortBy(e.target.value as SortBy)}
            >
              <MenuItem value="priority">Prioridad</MenuItem>
              <MenuItem value="dias">Días en espera</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <FormControl size="small" fullWidth>
            <InputLabel>Derivación</InputLabel>
            <Select
              value={selectedDerivacion ? String(selectedDerivacion.id) : ""}
              label="Derivación"
              onChange={(e: SelectChangeEvent) => {
                const val = e.target.value;
                setSelectedDerivacion(
                  val === "" ? null : derivaciones.find((x) => x.id === Number(val)) ?? null
                );
              }}
            >
              <MenuItem value=""><em>Ninguna</em></MenuItem>
              {derivaciones.map((ef) => (
                <MenuItem key={ef.id} value={ef.id}>{ef.nombre}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

      {/* Contador */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", mb: 1 }}>
        {loading ? (
          <Stack direction="row" spacing={1} alignItems="center">
            <CircularProgress size={18} />
            <Typography variant="body2">Cargando...</Typography>
          </Stack>
        ) : selectedEfector ? (
          <Typography variant="body2">{visibleTurnos.length} turnos visibles</Typography>
        ) : (
          <Typography variant="body2" color="text.secondary">Seleccione un efector</Typography>
        )}
      </Box>

      {/* Lista */}
      {!selectedEfector ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">Seleccione un efector para ver los turnos en espera.</Typography>
        </Paper>
      ) : visibleTurnos.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 3, textAlign: "center" }}>
          <Typography color="text.secondary">No hay turnos que coincidan con los filtros.</Typography>
        </Paper>
      ) : <ListaEsperaComponent
          visibleTurnos={visibleTurnos}
          handleOpenDialog={handleOpenDialog}
        />}

      {/* Dialog modularizado */}
      <DetalleTurno
        activeTurno={activeTurno}
        openDialog={openDialog}
        handleCloseDialog={handleCloseDialog}
        selectedEstudios={selectedEstudios}
        handleToggleEstudio={handleToggleEstudio}
        handleGuardarEstudios={handleGuardarEstudios}
        selectedDerivacion={selectedDerivacion?.id ?? null}
        handleRemove={handleRemove}
        isRemoving={isRemoving}
      />

      <AlertMessage
        open={alertOpen}
        handleClose={() => setAlertOpen(false)}
        message={alertMsg}
        severity={alertSeverity}
      />
    </Box>
  );
}