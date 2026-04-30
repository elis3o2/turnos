// MensajesDashboardPage.tsx
import {
  Box,
  Card,
  CardContent,
  Typography,
  Menu,
  MenuItem,
  Checkbox,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Divider,
  TextField,
  Stack,
} from '@mui/material'
import HospitalIcon from '../../assets/hospital.png'
import AidKitIcon from '../../assets/first-aid-kit.png'
import MedicalReportIcon from '../../assets/medical-report.png'
import { useMensajesDashboard } from './useMensajeDashboard'
import { EstadoRecordatorioCard } from './components/EstadoRecordatorioCard'
import { FilterIcon } from './components/FilterIcon'
import { StatCard } from './components/StatCard'


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
    anchorEfector, setAnchorEfector,
    anchorServicio, setAnchorServicio,
    anchorEspecialidad, setAnchorEspecialidad,
    loading,
    resumen,
    isServicioDisabled,
    isEspecialidadDisabled,
    handleToggleEfector,
    handleToggleServicio,
    handleToggleEspecialidad,
    removeChip,
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
        <FilterIcon
          src={HospitalIcon}
          label="efectores"
          disabled={false}
          onClick={e => setAnchorEfector(e.currentTarget)}
          chips={
            selectedEfectores.length === 0
              ? [{ id: -1, label: 'Todos los efectores' }]
              : selectedEfectores.map(id => ({
                  id,
                  label: efectores?.find(e => e.id === id)?.nombre ?? String(id),
                  onDelete: () => removeChip(setSelectedEfectores, id),
                }))
          }
        />

        <Menu
          anchorEl={anchorEfector}
          open={Boolean(anchorEfector)}
          onClose={() => setAnchorEfector(null)}
          PaperProps={{ style: { maxHeight: 320, minWidth: 260 } }}
        >
          <MenuItem onClick={() => { setSelectedEfectores([]); setAnchorEfector(null) }}>
            <ListItemText>Todos los efectores</ListItemText>
          </MenuItem>
          {efectores?.map(e => (
            <MenuItem key={e.id} onClick={() => handleToggleEfector(e.id)}>
              <ListItemIcon>
                <Checkbox edge="start" checked={selectedEfectores.includes(e.id)} />
              </ListItemIcon>
              <ListItemText>{e.nombre}</ListItemText>
            </MenuItem>
          ))}
        </Menu>

        <FilterIcon
          src={MedicalReportIcon}
          label="servicios"
          disabled={isServicioDisabled}
          onClick={e => { if (!isServicioDisabled) setAnchorServicio(e.currentTarget) }}
          chips={
            selectedServicios.length === 0
              ? [{ id: -1, label: 'Todos los servicios' }]
              : selectedServicios.map(id => ({
                  id,
                  label: servicios.find(s => s.id === id)?.nombre ?? String(id),
                  onDelete: () => removeChip(setSelectedServicios, id),
                }))
          }
        />

        <Menu
          anchorEl={anchorServicio}
          open={Boolean(anchorServicio)}
          onClose={() => setAnchorServicio(null)}
          PaperProps={{ style: { maxHeight: 360, minWidth: 280 } }}
        >
          <MenuItem onClick={() => { setSelectedServicios([]); setAnchorServicio(null) }}>
            <ListItemText>Todos los servicios</ListItemText>
          </MenuItem>
          {servicios.filter(s => availableServicios.includes(s.id)).map(s => (
            <MenuItem key={s.id} onClick={() => handleToggleServicio(s.id)}>
              <ListItemIcon>
                <Checkbox edge="start" checked={selectedServicios.includes(s.id)} />
              </ListItemIcon>
              <ListItemText>{s.nombre}</ListItemText>
            </MenuItem>
          ))}
        </Menu>

        <FilterIcon
          src={AidKitIcon}
          label="especialidades"
          disabled={isEspecialidadDisabled}
          onClick={e => { if (!isEspecialidadDisabled) setAnchorEspecialidad(e.currentTarget) }}
          chips={
            selectedEspecialidades.length === 0
              ? [{ id: -1, label: 'Todas las especialidades' }]
              : selectedEspecialidades.map(id => ({
                  id,
                  label: especialidades.find(e => e.id === id)?.nombre ?? String(id),
                  onDelete: () => removeChip(setSelectedEspecialidades, id),
                }))
          }
        />

        <Menu
          anchorEl={anchorEspecialidad}
          open={Boolean(anchorEspecialidad)}
          onClose={() => setAnchorEspecialidad(null)}
          PaperProps={{ style: { maxHeight: 360, minWidth: 320 } }}
        >
          <MenuItem onClick={() => { setSelectedEspecialidades([]); setAnchorEspecialidad(null) }}>
            <ListItemText>Todas las especialidades</ListItemText>
          </MenuItem>
          {especialidades.filter(e => availableEspecialidades.includes(e.id)).map(es => (
            <MenuItem key={es.id} onClick={() => handleToggleEspecialidad(es.id)}>
              <ListItemIcon>
                <Checkbox edge="start" checked={selectedEspecialidades.includes(es.id)} />
              </ListItemIcon>
              <ListItemText>{es.nombre}</ListItemText>
            </MenuItem>
          ))}
        </Menu>

        {/* ── Filtros de fecha ─────────────────────── */}
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            label="Desde"
            type="date"
            size="small"
            value={selectedDesde}
            onChange={e => setSelectedDesde(e.target.value)}
            inputProps={{ max: selectedHasta }}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 155 }}
          />
          <TextField
            label="Hasta"
            type="date"
            size="small"
            value={selectedHasta}
            onChange={e => setSelectedHasta(e.target.value)}
            inputProps={{ min: selectedDesde }}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 155 }}
          />
        </Stack>
      </Box>

      {/* ── TARJETAS RESUMEN ─────────────────────── */}
      <Box
        sx={{
          width: '80%',
          minWidth: 400,
          mx: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Card sx={{ textAlign: 'center', borderRadius: 4, boxShadow: 4, p: 2 }}>
          <CardContent>
            <Typography variant="overline" color="text.secondary" letterSpacing={2}>
              Total de mensajes
            </Typography>
            <Typography variant="h2" fontWeight={700} sx={{ mt: 1 }}>
              {resumen.total.toLocaleString()}
            </Typography>
          </CardContent>
        </Card>

        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 2,
          }}
        >
          <StatCard label="Mensajes de asignación" value={resumen.total_asignacion} />
          <StatCard label="Mensajes de cancelación" value={resumen.total_cancelacion} />
          <StatCard label="Mensajes de reprogramación" value={resumen.total_reprogramacion} />
          <StatCard label="Mensajes de recordatorio" value={resumen.total_recordatorio} />
        </Box>
      </Box>

      {/* ── RECORDATORIOS + ESTADOS ─────────────── */}
      <Box
        sx={{
          width: '80%',
          minWidth: 400,
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
            <Typography variant="h3" fontWeight={700} sx={{ mt: 1 }}>
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