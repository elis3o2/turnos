import {
  Box,
  GridLegacy as Grid,
  Button,
} from '@mui/material';
import type { Efector } from '../../features/efector/types';
import { ServicioBlock } from './components/ServicioBlock/ServicioBlock';
import { EspecialidadBlock } from './components/EspecialidadBlock/EspecialidadBlock';
import { AlertMessage } from '../../common/components';

import { useConfiguracion } from './useConfiguracion';
import { BurbujaCard } from './components/BurbujaCard';
// ---------------------- Página ----------------------
export function ConfiguracionPage() {
  const {
    efectores,
    permiso,
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
            <BurbujaCard
              name={item.nombre}
              selected={efectorSelIds.has(item.id)}
              onClick={() => handleEfectorClick(item)}
              color='rgba(177, 248, 248, 1)'
            />
          </Grid>
        ))}
      </Grid>

      {/* Servicios */}
      {efectorSeleccionado.length > 0 && (
        <ServicioBlock
          permiso={permiso}
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
          permiso={permiso}
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