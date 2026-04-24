import { useEffect, useState, useCallback, useContext, useRef } from 'react'
import type { Especialidad, Servicio, EfeSerEsp, Efector } from '../../features/efector/types'
import {
  getServiciosAll,
  getEspecialidadesAll,
  getEfeSerEspAll,
} from '../../features/efector/api'
import { getMensajesCount } from '../../features/mensaje/api'
import type { MensajeCount } from '../../features/mensaje/types'
import { AuthContext } from '../../common/contex'


export function useMensajesDashboard() {
  const { efectores } = useContext(AuthContext) as { efectores?: Efector[] };
  const [servicios, setServicios] = useState<Servicio[]>([])
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([])
  const [combinaciones, setCombinaciones] = useState<EfeSerEsp[]>([])

  const [availableServicios, setAvailableServicios] = useState<number[]>([])
  const [availableEspecialidades, setAvailableEspecialidades] = useState<number[]>([])

  const [selectedEfectores, setSelectedEfectores] = useState<number[]>([])
  const [selectedServicios, setSelectedServicios] = useState<number[]>([])
  const [selectedEspecialidades, setSelectedEspecialidades] = useState<number[]>([])

  const [anchorEfector, setAnchorEfector] = useState<null | HTMLElement>(null)
  const [anchorServicio, setAnchorServicio] = useState<null | HTMLElement>(null)
  const [anchorEspecialidad, setAnchorEspecialidad] = useState<null | HTMLElement>(null)

  const [loading, setLoading] = useState(true)
  const [resumen, setResumen] = useState<MensajeCount>({
    total_asignacion: 0,
    total_recordatorio: 0,
    estados_recordatorio: [],
  })

  // ── Init ──────────────────────────────────

  useEffect(() => {
    const init = async () => {
      try {
        const [se, es, co] = await Promise.all([
          getServiciosAll(),
          getEspecialidadesAll(),
          getEfeSerEspAll(),
        ])
        setServicios(se)
        setEspecialidades(es)
        setCombinaciones(co)
        setAvailableServicios(se.map(s => s.id))
        setAvailableEspecialidades(es.map(e => e.id))
      } catch (err) {
        console.error('Error inicializando datos:', err)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  // ── Filtros encadenados ───────────────────
  // Se recalculan directo en useEffect, sin useCallback intermedio

  // Cuando cambia efector → recalcular servicios y especialidades disponibles
  useEffect(() => {
    if (combinaciones.length === 0) return

    if (selectedEfectores.length === 0) {
      setAvailableServicios(servicios.map(s => s.id))
      setAvailableEspecialidades(especialidades.map(e => e.id))
      setSelectedServicios([])
      setSelectedEspecialidades([])
      return
    }

    const posibles = combinaciones.filter(p => selectedEfectores.includes(p.id_efector))
    const newServicios = [...new Set(posibles.map(p => p.id_servicio))]
    setAvailableServicios(newServicios)

    // Limpiar servicios seleccionados que ya no están disponibles
    setSelectedServicios(prev => prev.filter(id => newServicios.includes(id)))

    // Especialidades según efector (sin servicio seleccionado aún)
    setAvailableEspecialidades([...new Set(posibles.map(p => p.id_especialidad))])
    setSelectedEspecialidades([])

  }, [selectedEfectores, combinaciones, servicios, especialidades])

  // Cuando cambia servicio → recalcular especialidades disponibles
  useEffect(() => {
    if (combinaciones.length === 0) return

    if (selectedServicios.length === 0) {
      // Sin servicio: especialidades disponibles según efector
      const posibles = selectedEfectores.length > 0
        ? combinaciones.filter(p => selectedEfectores.includes(p.id_efector))
        : combinaciones
      setAvailableEspecialidades([...new Set(posibles.map(p => p.id_especialidad))])
      setSelectedEspecialidades([])
      return
    }

    const posibles = combinaciones.filter(p =>
      selectedEfectores.includes(p.id_efector) &&
      selectedServicios.includes(p.id_servicio)
    )
    const newEsp = [...new Set(posibles.map(p => p.id_especialidad))]
    setAvailableEspecialidades(newEsp)
    setSelectedEspecialidades(prev => prev.filter(id => newEsp.includes(id)))

  }, [selectedServicios, selectedEfectores, combinaciones])

  // ── Fetch resumen ─────────────────────────

  const fetchResumen = useCallback(async () => {
    const idsEfe = selectedEfectores.length > 0
      ? selectedEfectores
      : (efectores?.map(e => e.id) ?? [])

    if (idsEfe.length === 0) return

    try {
      const data = await getMensajesCount(
        idsEfe,
        selectedServicios,
        selectedEspecialidades,
      )
      setResumen(data)
    } catch (err) {
      console.error('Error obteniendo resumen de mensajes:', err)
    }
  }, [selectedEfectores, selectedServicios, selectedEspecialidades, efectores])

  useEffect(() => { fetchResumen() }, [fetchResumen])

  // ── Handlers ──────────────────────────────

  const handleToggleEfector = (id: number) =>
    setSelectedEfectores(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])

  const handleToggleServicio = (id: number) =>
    setSelectedServicios(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])

  const handleToggleEspecialidad = (id: number) =>
    setSelectedEspecialidades(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])

  const removeChip = (setter: React.Dispatch<React.SetStateAction<number[]>>, id: number) =>
    setter(prev => prev.filter(x => x !== id))

  const isServicioDisabled = selectedEfectores.length === 0
  const isEspecialidadDisabled = selectedServicios.length === 0

  return {
    efectores, servicios, especialidades,
    availableServicios, availableEspecialidades,
    selectedEfectores, selectedServicios, selectedEspecialidades,
    anchorEfector, setAnchorEfector,
    anchorServicio, setAnchorServicio,
    anchorEspecialidad, setAnchorEspecialidad,
    loading, resumen,
    isServicioDisabled, isEspecialidadDisabled,
    handleToggleEfector, handleToggleServicio, handleToggleEspecialidad,
    removeChip,
    setSelectedEfectores, setSelectedServicios, setSelectedEspecialidades,
  }
}