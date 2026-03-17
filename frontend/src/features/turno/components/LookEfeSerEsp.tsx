import React, { useEffect, useState } from "react";
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Paper,
  Button,
  Stack,
  CircularProgress,
  Alert,
} from "@mui/material";

import {
  getSerEspByEfector,
  getDerivaByEfector,
  getIdByEfeSerEsp,
} from "../../efe_ser_esp/api";

import type {
  Efector,
  Servicio,
  Especialidad,
  EfeSerEspCompleto,
  Deriva,
  SerEsp,
} from "../../efector/types";

interface Props {
  setCupo: React.Dispatch<React.SetStateAction<boolean>>;
  efector: Efector;
  setEfeSerEspSeleccionado: React.Dispatch<
    React.SetStateAction<EfeSerEspCompleto | null>
  >;
  setFinishEfeSerEsp: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function LookEfeSerEsp({
  setCupo,
  efector,
  setEfeSerEspSeleccionado,
  setFinishEfeSerEsp,
}: Props) {
  const [serEsp, setSerEsp] = useState<SerEsp[]>([]);
  const [derivaciones, setDerivaciones] = useState<Deriva[]>([]);

  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [selectedServicio, setSelectedServicio] = useState<Servicio | null>(
    null
  );

  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [selectedEspecialidad, setSelectedEspecialidad] =
    useState<Especialidad | null>(null);

  const [efectores, setEfectores] = useState<Efector[]>([]);
  const [selectedEfector, setSelectedEfector] = useState<Efector | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // -----------------------
  // Helper mappers
  // -----------------------
  const mapSerEspServiceToServicio = (s: SerEsp): Servicio => {
    return { id: s.id_ser, nombre: s.ser_nombre } as Servicio;
  };

  const mapSerEspEspecialidadToEspecialidad = (
    esp: { id_esp: number; esp_nombre: string }
  ): Especialidad => {
    return { id: esp.id_esp, nombre: esp.esp_nombre } as Especialidad;
  };

  // -----------------------
  // Load on mount: both endpoints
  // -----------------------
  useEffect(() => {
    let mounted = true;
    async function load() {
      setError(null);
      try {
        const [sres, dres] = await Promise.all([
          getSerEspByEfector(efector.id),
          getDerivaByEfector(efector.id),
        ]);
        if (!mounted) return;
        setSerEsp(sres ?? []);
        setDerivaciones(dres ?? []);

        const serviciosMap = new Map<number, Servicio>();
        (sres ?? []).forEach((se: SerEsp) => {
          const srv = mapSerEspServiceToServicio(se);
          serviciosMap.set(srv.id, srv);
        });
        (dres ?? []).forEach((dv: Deriva) => {
          const srv = dv.servicio_deriva;
          if (!serviciosMap.has(srv.id)) serviciosMap.set(srv.id, srv);
        });
        setServicios(
          Array.from(serviciosMap.values()).sort((a, b) =>
            a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" })
          )
        );
      } catch (e: any) {
        console.error(e);
        setError(
          e?.response?.data ?? e?.message ?? "Error al cargar servicios/derivaciones"
        );
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [efector.id]);

  // -----------------------
  // When a servicio is selected: set especialidades and efector(es)
  // NOTE: no decidimos cupo todavía (lo hacemos al seleccionar especialidad)
  // -----------------------
  useEffect(() => {
    if (!selectedServicio) {
      setEspecialidades([]);
      setSelectedEspecialidad(null);
      setEfectores([]);
      setSelectedEfector(null);
      setCupo(false); // default
      return;
    }

    setError(null);

    const serespEntry = serEsp.find((s) => s.id_ser === selectedServicio.id);

    // derivaciones del servicio actual (si las hay)
    const derivsForSrv = derivaciones.filter(
      (d) => d.servicio_deriva?.id === selectedServicio.id
    );

    if (serespEntry) {
      // Especialidades desde SerEsp
      const epsFromSerEsp = (serespEntry.especialidades ?? []).map((e) =>
        mapSerEspEspecialidadToEspecialidad({
          id_esp: e.id_esp,
          esp_nombre: e.esp_nombre,
        })
      );

      // Especialidades desde las derivaciones para este servicio
      const epsFromDer = derivsForSrv
        .map((d) => d.especialidad_deriva)
        .filter(Boolean) as Especialidad[];

      // Unir y deduplicar por id
      const allEpsMap = new Map<number, Especialidad>();
      [...epsFromSerEsp, ...epsFromDer].forEach((ep) => {
        if (ep && !allEpsMap.has(ep.id)) allEpsMap.set(ep.id, ep);
      });

      const uniqueEps = Array.from(allEpsMap.values()).sort((a, b) =>
        a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" })
      );

      setEspecialidades(uniqueEps);
      setSelectedEspecialidad(null);

      // Efectores: incluir el efector propio y los efectores de las derivaciones (deduplicados)
      const efectoresMap = new Map<number, Efector>();
      efectoresMap.set(efector.id, efector);
      derivsForSrv.forEach((d) => {
        const ef = d.efector_deriva;
        if (ef && !efectoresMap.has(ef.id)) efectoresMap.set(ef.id, ef);
      });

      const efectoresList = Array.from(efectoresMap.values());
      setEfectores(efectoresList);

      // mantener seleccionado por defecto el efector propio (puedes ajustar si prefieres otro)
      setSelectedEfector(efector);

      // si proviene de SerEsp, cupo = false (se decide sólo por derivaciones exactas)
      setCupo(false);
    } else {
      // Servicio viene de derivaciones (no está en SerEsp)
      const epsFromDer = derivsForSrv
        .map((d) => d.especialidad_deriva)
        .filter(Boolean) as Especialidad[];

      const uniqueEps = Array.from(
        new Map(epsFromDer.map((x) => [x.id, x])).values()
      ).sort((a, b) =>
        a.nombre.localeCompare(b.nombre, "es", { sensitivity: "base" })
      );

      setEspecialidades(uniqueEps);
      setSelectedEspecialidad(null);

      if (derivsForSrv.length > 0) {
        const efDefault = derivsForSrv[0].efector_deriva;
        setEfectores([efDefault]);
        setSelectedEfector(efDefault);
      } else {
        setEfectores([]);
        setSelectedEfector(null);
      }

      setCupo(false);
    }
  }, [selectedServicio, serEsp, derivaciones, efector, setCupo]);


  // -----------------------
  // Cuando cambia especialidad: buscamos la derivación exacta (servicio+especialidad)
  // Si existe y cupo === 1 => setCupo(true), sino setCupo(false).
  // -----------------------
  useEffect(() => {
    if (!selectedServicio || !selectedEspecialidad) return;

    // derivaciones que coinciden EXACTAMENTE
    const derivsExact = derivaciones.filter(
      (d) =>
        d.servicio_deriva?.id === selectedServicio.id &&
        d.especialidad_deriva?.id === selectedEspecialidad.id
    );

    if (derivsExact.length > 0) {
      // reconstruimos la lista de efectores desde cero
      const efectoresMap = new Map<number, Efector>();

      derivsExact.forEach((d) => {
        const ef = d.efector_deriva;
        if (ef && !efectoresMap.has(ef.id)) {
          efectoresMap.set(ef.id, ef);
        }
      });

      const nuevosEfectores = Array.from(efectoresMap.values());

      setEfectores(nuevosEfectores);

      // seleccionar automáticamente el primero
      setSelectedEfector(nuevosEfectores[0] ?? null);

      // cupo depende de la derivación exacta
      setCupo(Number(derivsExact[0].cupo) === 1);
    } else {
      // no hay derivación exacta → usar efector propio
      const serespEntry = serEsp.find(
        (s) => s.id_ser === selectedServicio.id
      );

      if (serespEntry) {
        setEfectores([efector]);
        setSelectedEfector(efector);
      } else {
        setEfectores([]);
        setSelectedEfector(null);
      }

      setCupo(false);
    }
  }, [
    selectedServicio,
    selectedEspecialidad,
    derivaciones,
    serEsp,
    efector,
    setCupo,
  ]);

  // -----------------------
  // Confirmar selección
  // -----------------------
  const handleConfirm = async () => {
    setError(null);

    if (!selectedEfector || !selectedServicio || !selectedEspecialidad) {
      setError("Faltan seleccionar efector/servicio/especialidad.");
      return;
    }

    setLoading(true);
    try {
      const res = await getIdByEfeSerEsp(
        selectedEfector.id,
        selectedServicio.id,
        selectedEspecialidad.id
      );
      setEfeSerEspSeleccionado(res);
      setFinishEfeSerEsp(true);
    } catch (e: any) {
      console.error(e);
      const msg = e?.response?.data ?? e?.message ?? "Error al obtener EfeSerEsp.";
      setError(String(msg));
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSelectedEfector(null);
    setEfeSerEspSeleccionado(null);
    setFinishEfeSerEsp(false);
    setError(null);
    setSelectedServicio(null);
    setSelectedEspecialidad(null);
    setEfectores([]);
    setCupo(false); // resetear la bandera
  };

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", p: 1 }}>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Seleccionar servicio / especialidad / efector
      </Typography>

      <FormControl fullWidth size="small" sx={{ mb: 2 }}>
        <InputLabel id="servicio-label">Servicio</InputLabel>
        <Select
          labelId="servicio-label"
          value={selectedServicio?.id ?? ""}
          label="Servicio"
          onChange={(e) => {
            const id = Number(e.target.value);
            const srv = servicios.find((s) => s.id === id) ?? null;
            setSelectedServicio(srv);
          }}
        >
          <MenuItem value="">
            <em>-- Seleccioná servicio --</em>
          </MenuItem>
          {servicios.map((s) => (
            <MenuItem key={s.id} value={s.id}>
              {s.nombre}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl
        fullWidth
        size="small"
        sx={{ mb: 2 }}
        disabled={!selectedServicio || especialidades.length === 0}
      >
        <InputLabel id="especialidad-label">Especialidad</InputLabel>
        <Select
          labelId="especialidad-label"
          value={selectedEspecialidad?.id ?? ""}
          label="Especialidad"
          onChange={(e) => {
            const id = Number(e.target.value);
            const esp = especialidades.find((x) => x.id === id) ?? null;
            setSelectedEspecialidad(esp);
          }}
        >
          <MenuItem value="">
            <em>-- Seleccioná especialidad --</em>
          </MenuItem>
          {especialidades.map((esp) => (
            <MenuItem key={esp.id} value={esp.id}>
              {esp.nombre}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl
        fullWidth
        size="small"
        sx={{ mb: 2 }}
        disabled={!selectedEspecialidad || efectores.length === 0}
      >
        <InputLabel id="efector-label">Efector</InputLabel>
        <Select
          labelId="efector-label"
          value={selectedEfector?.id ?? ""}
          label="Efector"
          onChange={(e) => {
            const id = Number(e.target.value);
            const ef = efectores.find((x) => x.id === id) ?? null;
            setSelectedEfector(ef);
          }}
        >
          <MenuItem value="">
            <em>-- Seleccioná efector --</em>
          </MenuItem>
          {efectores.map((ef) => (
            <MenuItem key={ef.id} value={ef.id}>
              {ef.nombre}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* cuadro de confirmar / limpiar */}
      {selectedEfector && (
        <Paper variant="outlined" sx={{ p: 2, mt: 1 }}>
          <Typography variant="subtitle2">Efector seleccionado</Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            {selectedEfector.nombre}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 1 }}>
              {error}
            </Alert>
          )}

          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              onClick={handleConfirm}
              disabled={loading || !selectedServicio || !selectedEspecialidad}
            >
              {loading ? <CircularProgress size={18} color="inherit" /> : "Confirmar"}
            </Button>

            <Button variant="outlined" onClick={handleClear} disabled={loading}>
              Limpiar
            </Button>
          </Stack>
        </Paper>
      )}

      {/* errores generales */}
      {error && !selectedEfector && (
        <Paper variant="outlined" sx={{ p: 1, mt: 1 }}>
          <Typography color="error" variant="body2">
            {error}
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
