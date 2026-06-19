import { useEffect, useState, useCallback, useContext } from 'react'
import type { Especialidad, Servicio, EfeSerEsp, Efector } from '@/features/efector/types'
import {
  getServiciosAll,
  getEspecialidadesAll,
  getEfeSerEspAll,
} from '../../features/efector/api'
import { getMensajesCount } from '@/features/mensaje/api'
import type { MensajeCount } from '@/features/mensaje/types'
import { AuthContext } from '@/common/contex'
import { getDefaultDesde } from './utilsMensajeDashboard'

// ─────────────────────────────────────────────────────────────────────────────

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

  // ── Fechas ────────────────────────────────────────────────────────────────
  const [selectedDesde, setSelectedDesde] = useState<string | null>(getDefaultDesde)
  const [selectedHasta, setSelectedHasta] = useState<string | null>(null)

  const [loading, setLoading] = useState(true)
  const [resumen, setResumen] = useState<MensajeCount>({
    total: 0,
    total_asignacion: 0,
    total_recordatorio: 0,
    total_cancelacion: 0,
    total_reprogramacion: 0,
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
    setSelectedServicios(prev => prev.filter(id => newServicios.includes(id)))
    setAvailableEspecialidades([...new Set(posibles.map(p => p.id_especialidad))])
    setSelectedEspecialidades([])

  }, [selectedEfectores, combinaciones, servicios, especialidades])

  useEffect(() => {
    if (combinaciones.length === 0) return

    if (selectedServicios.length === 0) {
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
        selectedDesde,
        selectedHasta,
      )
      setResumen(data)
    } catch (err) {
      console.error('Error obteniendo resumen de mensajes:', err)
    }
  }, [selectedEfectores, selectedServicios, selectedEspecialidades, selectedDesde, selectedHasta, efectores])

  useEffect(() => { fetchResumen() }, [fetchResumen])


  return {
    efectores, servicios, especialidades,
    availableServicios, availableEspecialidades,
    selectedEfectores, selectedServicios, selectedEspecialidades,
    selectedDesde, setSelectedDesde,
    selectedHasta, setSelectedHasta,
    loading, resumen,
    setSelectedEfectores, setSelectedServicios, setSelectedEspecialidades,
  }
}