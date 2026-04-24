// MensajesDashboardPage.tsx
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  Checkbox,
  ListItemIcon,
  ListItemText,
  Chip,
  Stack,
  CircularProgress,
  Divider,
} from '@mui/material'
import HospitalIcon from '../../assets/hospital.png'
import AidKitIcon from '../../assets/first-aid-kit.png'
import MedicalReportIcon from '../../assets/medical-report.png'
import { useMensajesDashboard } from './useMensajeDashboard'
import { ESTADO_COLORS, DEFAULT_ESTADO_COLOR } from './utilsMensajeDashboard'

// ─────────────────────────────────────────────
// SUBCOMPONENTE: ícono de filtro
// ─────────────────────────────────────────────

interface ChipItem {
  id: number
  label: string
  onDelete?: () => void
}

interface FilterIconProps {
  src: string
  label: string
  disabled: boolean
  onClick: (e: React.MouseEvent<HTMLElement>) => void
  chips: ChipItem[]
}

function FilterIcon({ src, label, disabled, onClick, chips }: FilterIconProps) {
  return (
    <Box sx={{ textAlign: 'center' }}>
      <IconButton
        onClick={onClick}
        sx={{
          width: 100,
          height: 100,
          borderRadius: 3,
          filter: disabled ? 'brightness(0.65) saturate(0.4)' : 'none',
          cursor: disabled ? 'default' : 'pointer',
          transition: 'filter 0.2s',
        }}
        aria-label={label}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
      >
        <img src={src} alt={label} width={56} height={56} />
      </IconButton>

      <Stack
        direction="row"
        spacing={0.5}
        justifyContent="center"
        sx={{ mt: 1, flexWrap: 'wrap', maxWidth: 220 }}
      >
        {chips.map(chip => (
          <Chip
            key={chip.id}
            label={chip.label}
            size="small"
            onDelete={chip.onDelete}
            sx={{ backgroundColor: '#1976d2', color: 'white', my: 0.25 }}
          />
        ))}
      </Stack>
    </Box>
  )
}

// ─────────────────────────────────────────────
// PÁGINA PRINCIPAL
// ─────────────────────────────────────────────

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
    anchorEfector,   setAnchorEfector,
    anchorServicio,  setAnchorServicio,
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
      <Box sx={{ display: 'flex', gap: 6, alignItems: 'flex-start' }}>

        {/* Efector */}
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
              <ListItemIcon><Checkbox edge="start" checked={selectedEfectores.includes(e.id)} /></ListItemIcon>
              <ListItemText>{e.nombre}</ListItemText>
            </MenuItem>
          ))}
        </Menu>

        {/* Servicio */}
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
              <ListItemIcon><Checkbox edge="start" checked={selectedServicios.includes(s.id)} /></ListItemIcon>
              <ListItemText>{s.nombre}</ListItemText>
            </MenuItem>
          ))}
        </Menu>

        {/* Especialidad */}
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
              <ListItemIcon><Checkbox edge="start" checked={selectedEspecialidades.includes(es.id)} /></ListItemIcon>
              <ListItemText>{es.nombre}</ListItemText>
            </MenuItem>
          ))}
        </Menu>

      </Box>

      {/* ── CARD PRINCIPAL: ASIGNACIÓN ───────────── */}
      <Card sx={{ width: '60%', minWidth: 400, textAlign: 'center', borderRadius: 4, boxShadow: 4, p: 2 }}>
        <CardContent>
          <Typography variant="overline" color="text.secondary" letterSpacing={2}>
            Mensajes de confirmación enviados
          </Typography>
          <Typography variant="h2" fontWeight={700} sx={{ mt: 1 }}>
            {resumen.total_asignacion.toLocaleString()}
          </Typography>
        </CardContent>
      </Card>

      {/* ── CARD RECORDATORIO + ESTADOS ─────────── */}
      <Box
        sx={{
          width: '60%',
          minWidth: 400,
          display: 'flex',
          gap: 2,
          alignItems: 'stretch',
          flexWrap: 'wrap',
        }}
      >
        <Card
          sx={{
            flex: '0 0 auto',
            width: 200,
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
            gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
            gap: 1.5,
            alignContent: 'center',
          }}
        >
          {resumen.estados_recordatorio.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ gridColumn: '1 / -1', py: 2 }}>
              Sin datos de estados
            </Typography>
          ) : (
            resumen.estados_recordatorio.map(({ estado, count }) => {
              const colors = ESTADO_COLORS[estado.toLowerCase()] ?? DEFAULT_ESTADO_COLOR
              return (
                <Box
                  key={estado}
                  sx={{
                    background: colors.bg,
                    border: `1.5px solid ${colors.border}`,
                    borderRadius: 3,
                    p: 1.5,
                    textAlign: 'center',
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: colors.color,
                      fontWeight: 600,
                      letterSpacing: 1,
                      textTransform: 'uppercase',
                      fontSize: 10,
                    }}
                  >
                    {estado}
                  </Typography>
                  <Typography variant="h5" fontWeight={700} sx={{ color: colors.color, mt: 0.5 }}>
                    {count.toLocaleString()}
                  </Typography>
                </Box>
              )
            })
          )}
        </Box>
      </Box>

    </Box>
  )
}

