import { useEffect, useMemo, useState } from "react"
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
} from "@mui/material"

import type {
  Deriva,
  Efector,
  Servicio,
  Especialidad,
  EfeSerEsp,
} from "@/features/efector/types"

import {
  getEfectoresAll,
  getServiciosAll,
  getEspecialidadesAll,
  getEfeSerEspAll,
  postDeriva,
} from "@/features/efector/api"

type Props = {
  efector: Efector
  derivaciones: Deriva[]
  onCreated?: () => void
}

export const AddDeriva = ({
  efector,
  derivaciones,
  onCreated,
}: Props) => {
  const [efectores, setEfectores] = useState<Efector[]>([])
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([])
  const [combinaciones, setCombinaciones] = useState<EfeSerEsp[]>([])

  const [selectedEfector, setSelectedEfector] = useState<number | "">("")
  const [selectedServicio, setSelectedServicio] = useState<number | "">("")
  const [selectedEspecialidad, setSelectedEspecialidad] = useState<number | "">("")

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const init = async () => {
      try {
        const [ef, se, es, co] = await Promise.all([
          getEfectoresAll(),
          getServiciosAll(),
          getEspecialidadesAll(),
          getEfeSerEspAll(),
        ])

        setEfectores(ef)
        setServicios(se)
        setEspecialidades(es)
        setCombinaciones(co)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [])

  const combinacionesDisponibles = useMemo(() => {
    return combinaciones.filter(
      (c) =>
        !derivaciones.some(
          (d) =>
            d.efector_deriva.id === c.id_efector &&
            d.servicio_deriva.id === c.id_servicio &&
            d.especialidad_deriva.id === c.id_especialidad
        )
    )
  }, [combinaciones, derivaciones])

  const efectoresDisponibles = useMemo(() => {
    const ids = [...new Set(combinacionesDisponibles.map((c) => c.id_efector))]

    return efectores.filter(
      (e) => e.id !== efector.id && ids.includes(e.id)
    )
  }, [efectores, combinacionesDisponibles, efector.id])

  const serviciosDisponibles = useMemo(() => {
    if (!selectedEfector) return []

    const ids = [
      ...new Set(
        combinacionesDisponibles
          .filter((c) => c.id_efector === selectedEfector)
          .map((c) => c.id_servicio)
      ),
    ]

    return servicios.filter((s) => ids.includes(s.id))
  }, [selectedEfector, combinacionesDisponibles, servicios])

  const especialidadesDisponibles = useMemo(() => {
    if (!selectedEfector || !selectedServicio) return []

    const ids = [
      ...new Set(
        combinacionesDisponibles
          .filter(
            (c) =>
              c.id_efector === selectedEfector &&
              c.id_servicio === selectedServicio
          )
          .map((c) => c.id_especialidad)
      ),
    ]

    return especialidades.filter((e) => ids.includes(e.id))
  }, [
    selectedEfector,
    selectedServicio,
    combinacionesDisponibles,
    especialidades,
  ])

  useEffect(() => {
    setSelectedServicio("")
    setSelectedEspecialidad("")
  }, [selectedEfector])

  useEffect(() => {
    setSelectedEspecialidad("")
  }, [selectedServicio])

  const handleGuardar = async () => {
    if (
      !selectedEfector ||
      !selectedServicio ||
      !selectedEspecialidad
    ) {
      return
    }

    try {
      setSaving(true)

      await postDeriva(
        efector.id,
        selectedEfector,
        selectedServicio,
        selectedEspecialidad
      )

      setSelectedEfector("")
      setSelectedServicio("")
      setSelectedEspecialidad("")

      onCreated?.()
    } catch (err) {
      console.error(err)
      alert("Error al crear la derivación")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={3}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      gap={2}
      maxWidth={600}
    >
      <Typography variant="h6">
        Nueva derivación
      </Typography>

      <FormControl fullWidth>
        <InputLabel>Efector destino</InputLabel>
        <Select
          value={selectedEfector}
          label="Efector destino"
          onChange={(e) =>
            setSelectedEfector(Number(e.target.value))
          }
        >
          {efectoresDisponibles.map((e) => (
            <MenuItem key={e.id} value={e.id}>
              {e.nombre}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth disabled={!selectedEfector}>
        <InputLabel>Servicio</InputLabel>
        <Select
          value={selectedServicio}
          label="Servicio"
          onChange={(e) =>
            setSelectedServicio(Number(e.target.value))
          }
        >
          {serviciosDisponibles.map((s) => (
            <MenuItem key={s.id} value={s.id}>
              {s.nombre}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl
        fullWidth
        disabled={!selectedEfector || !selectedServicio}
      >
        <InputLabel>Especialidad</InputLabel>
        <Select
          value={selectedEspecialidad}
          label="Especialidad"
          onChange={(e) =>
            setSelectedEspecialidad(Number(e.target.value))
          }
        >
          {especialidadesDisponibles.map((esp) => (
            <MenuItem key={esp.id} value={esp.id}>
              {esp.nombre}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box display="flex" justifyContent="flex-end">
        <Button
          variant="contained"
          disabled={
            saving ||
            !selectedEfector ||
            !selectedServicio ||
            !selectedEspecialidad
          }
          onClick={handleGuardar}
        >
          Agregar derivación
        </Button>
      </Box>
    </Box>
  )
}