import {
  Box,
  GridLegacy as Grid,
  Card,
  CardContent,
  Typography,
  Button,
} from '@mui/material';
import type { Efector } from '../../features/efector/types';
import { ServicioBlock } from './components/ServicioBlock/ServicioBlock';
import { EspecialidadBlock } from './components/EspecialidadBlock/EspecialidadBlock';
import { AlertMessage } from '../../common/components';

import { useConfiguracion } from './useConfiguracion';

// ---------------------- Sub-componente: card de efector ----------------------
interface Props {
  efector: Efector;
  selected: boolean;
  onClick: () => void;
}

function EfectorCard({ efector, selected, onClick }: Props) {
  return (
    <Card
      onClick={onClick}
      sx={{
        p: 2,
        borderRadius: 5,
        textAlign: 'center',
        cursor: 'pointer',
        minHeight: 20,
        maxHeight: 30,
        width: 'auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: 4,
        border: '2px solid rgba(0,0,0,0.12)',
        bgcolor: selected ? 'rgba(177, 248, 248, 1)' : 'white',
        transition: 'background-color 200ms, border-color 200ms, box-shadow 200ms, transform 120ms',
        '&:hover': { borderColor: 'primary.main', boxShadow: 6, transform: 'translateY(-4px)' },
        '&:active': { transform: 'translateY(-1px)' },
        '&:focus-visible': {
          outline: 'none',
          borderColor: 'primary.main',
          boxShadow: '0 0 0 4px rgba(25,118,210,0.12)',
        },
        ...(selected && {
          borderColor: 'primary.main',
          boxShadow: 6,
          transform: 'translateY(-4px)',
        }),
      }}
    >
      <CardContent>
        <Typography variant="subtitle1" sx={{ fontWeight: 500 }}>
          {efector.nombre}
        </Typography>
      </CardContent>
    </Card>
  );
}

// ---------------------- Página ----------------------
export function ConfiguracionPage() {
  const {
    efectores,
    efectorSeleccionado,
    servicios,
    servicioSeleccionado,
    setServicioSeleccionado,
    especialidades,
    setEspecialidades,
    servicioEfectorActual,
    setServicioEfectorActual,
    efecServEspecialidades,
    setEfecServEspecialidades,
    open,
    setOpen,
    confirmEspecialidades,
    setConfirmEspecialidades,
    confirmField,
    setConfirmField,
    confirmValue,
    setConfirmValue,
    alertOpen,
    alertMsg,
    alertSeverity,
    setAlertOpen,
    setAlertMsg,
    setAlertSeverity,
    closeAlert,
    handleEfectorClick,
    navigateToPlantillas,
  } = useConfiguracion();

  const efectorSelIds = new Set(efectorSeleccionado.map(e => e.id));

  return (
    <Box sx={{ p: 3 }}>
      {/* Barra superior */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button variant="contained" onClick={navigateToPlantillas}>
          Plantillas
        </Button>
      </Box>

      {/* Grid de efectores */}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        {efectores.map((item: Efector) => (
          <Grid item xs="auto" sm="auto" md="auto" key={item.id} sx={{ display: 'flex', justifyContent: 'center' }}>
            <EfectorCard
              efector={item}
              selected={efectorSelIds.has(item.id)}
              onClick={() => handleEfectorClick(item)}
            />
          </Grid>
        ))}
      </Grid>

      {/* Servicios */}
      {efectorSeleccionado.length > 0 && (
        <ServicioBlock
          efectorSeleccionado={efectorSeleccionado}
          servicios={servicios}
          servicioSeleccionado={servicioSeleccionado}
          setServicioSeleccionado={setServicioSeleccionado}
          especialidades={especialidades}
          setEspecialidades={setEspecialidades}
          efecServEspecialidades={efecServEspecialidades}
          setEfecServEspecialidades={setEfecServEspecialidades}
          servicioEfectorActual={servicioEfectorActual}
          setServicioEfectorActual={setServicioEfectorActual}
          confirmField={confirmField}
          setConfirmField={setConfirmField}
          confirmValue={confirmValue}
          setConfirmValue={setConfirmValue}
          confirmEspecialidades={confirmEspecialidades}
          setConfirmEspecialidades={setConfirmEspecialidades}
          setAlertOpen={setAlertOpen}
          setAlertMsg={setAlertMsg}
          setAlertSeverity={setAlertSeverity}
          open={open}
          setOpen={setOpen}
        />
      )}

      {/* Especialidades */}
      {servicioSeleccionado.length > 0 && efectorSeleccionado.length > 0 && (
        <EspecialidadBlock
          open={open}
          setOpen={setOpen}
          especialidades={especialidades}
          setEspecialidades={setEspecialidades}
          efectorSeleccionado={efectorSeleccionado}
          confirmEspecialidades={confirmEspecialidades}
          setConfirmEspecialidades={setConfirmEspecialidades}
          confirmField={confirmField}
          setConfirmField={setConfirmField}
          confirmValue={confirmValue}
          setConfirmValue={setConfirmValue}
          efecServEspecialidades={efecServEspecialidades}
          setEfecServEspecialidades={setEfecServEspecialidades}
          setAlertOpen={setAlertOpen}
          setAlertMsg={setAlertMsg}
          setAlertSeverity={setAlertSeverity}
        />
      )}

      <AlertMessage
        open={alertOpen}
        handleClose={closeAlert}
        message={alertMsg}
        severity={alertSeverity}
      />
    </Box>
  );
}