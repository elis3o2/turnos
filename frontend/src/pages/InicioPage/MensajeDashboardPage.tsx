// MensajesDashboardPage.tsx
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Divider,
} from '@mui/material'
import { useMensajesDashboard } from './useMensajeDashboard'
import { EstadoRecordatorioCard } from './components/EstadoRecordatorioCard'
import { ActualizacionComponent } from './components/ActualizacionesComponent'
import { FilterFecha } from './components/FilterFecha'
import { TarjetaResumen } from './components/TarjetaResumen'
import { FilterEfeSerEsp } from './components/FilterEfeSerEsp'

export function MensajesDashboard() {
  const {
    efectores,
    servicios,
    especialidades,
    availableServicios,
    availableEspecialidades,
    selectedEfectores,
    selectedServicios,
    selectedEspecialidades,
    selectedDesde, setSelectedDesde,
    selectedHasta, setSelectedHasta,
    loading,
    resumen,
    setSelectedEfectores,
    setSelectedServicios,
    setSelectedEspecialidades,
  } = useMensajesDashboard()

  if (loading) {
    return (
      <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
        <CircularProgress />
        <Typography>Cargando datos...</Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      {/* ── FILTROS ─────────────────────────────────── */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 4,
          alignItems: 'flex-start',
          justifyContent: 'center',
        }}
      >
        {/* Filtros de entidad */}
        <FilterEfeSerEsp
          efectores={efectores}
          selectedEfectores={selectedEfectores}
          setSelectedEfectores={setSelectedEfectores}
          servicios={servicios}
          selectedServicios={selectedServicios}
          setSelectedServicios={setSelectedServicios}
          especialidades={especialidades}
          selectedEspecialidades={selectedEspecialidades}
          setSelectedEspecialidades={setSelectedEspecialidades}
          availableServicios={availableServicios}
          availableEspecialidades={availableEspecialidades}
        />

        {/* ── Filtros de fecha ─────────────────────── */}
        <FilterFecha
          selectedDesde={selectedDesde}
          setSelectedDesde={setSelectedDesde}
          selectedHasta={selectedHasta}
          setSelectedHasta={setSelectedHasta}
        />
        <ActualizacionComponent />
      </Box>

      {/* ── TARJETAS RESUMEN ─────────────────────── */}
      <TarjetaResumen
        resumen={resumen}
      />
      {/* ── RECORDATORIOS + ESTADOS ─────────────── */}
      <Box
        sx={{
          width: '70%',
          minWidth: 300,
          display: 'flex',
          gap: 2,
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 260px))',
          justifyContent: 'center',
          alignItems: 'stretch',
          flexWrap: 'wrap',
        }}
      >
        <Card
          sx={{
            flex: '0 0 auto',
            width: 230,
            textAlign: 'center',
            borderRadius: 4,
            boxShadow: 4,
            p: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <CardContent>
            <Typography variant="overline" color="text.secondary" letterSpacing={1.5} fontSize={11}>
              Recordatorios enviados
            </Typography>
            <Typography variant="h3" fontSize={40} fontWeight={700} sx={{ mt: 1 }}>
              {resumen.total_recordatorio.toLocaleString()}
            </Typography>
          </CardContent>
        </Card>

        <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

        <Box
          sx={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: 1.5,
            alignContent: 'center',
          }}
        >
          {resumen.estados_recordatorio.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ gridColumn: '1 / -1', py: 2 }}>
              Sin datos de estados
            </Typography>
          ) : (
            resumen.estados_recordatorio.map(({ estado, count, estado_turno }) => (
              <EstadoRecordatorioCard
                key={estado}
                estado={estado}
                count={count}
                estadoTurno={estado_turno}
              />
            ))
          )}
        </Box>
      </Box>
    </Box>
  )
}