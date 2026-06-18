import React from 'react';
import {
  Box,
  GridLegacy as Grid,
  Typography,
  TextField,
  Chip,
} from '@mui/material';
import { AlertMessage } from '@/common/components';
import { usePlantillas } from './usePlantillas';
import PlantillaComponent from './components/PlantillaComponent';
import { TIPO_TO_LABEL, TIPO_TO_COLOR, TIPO_KEYS } from './utilsPlantillas';

// ─── Componente principal ─────────────────────────────────────────────────────
export default function PlantillasPage(): React.ReactElement {
  const {
    plantillas,
    grouped,
    loading,
    updating,
    tipo,
    isModificationMode,
    diasAntes,
    setDiasAntes,
    alertOpen,
    alertMsg,
    alertSeverity,
    closeAlert,
    handleCardAssign,
  } = usePlantillas();

  if (loading) return <Typography>Cargando plantillas...</Typography>;
  if (plantillas.length === 0) return <Typography>No hay plantillas disponibles</Typography>;

  return (
    <Box sx={{ p: 3 }}>
      {isModificationMode ? (
        // ── Modo modificación: cards seleccionables ──────────────────────────
        <>
          {tipo === 'recordatorio' && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Ingrese los días antes del turno para enviar recordatorio:
              </Typography>
              <TextField
                type="number"
                label="Días antes"
                value={diasAntes}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val === '' || (Number(val) >= 0 && Number(val) <= 5)) {
                    setDiasAntes(val);
                  }
                }}
                size="small"
                sx={{ width: 150 }}
                inputProps={{ min: 0, max: 5 }}
              />
            </Box>
          )}

          <Grid container spacing={2}>
            <PlantillaComponent
              items={plantillas}
              updating={updating}
              onAssign={handleCardAssign}
            />
          </Grid>
        </>
      ) : (
        // ── Modo visualización: agrupado por tipo ────────────────────────────
        <Grid container spacing={2}>
          {TIPO_KEYS.map((t) => {
            const items = grouped[t] ?? [];
            console.log(items)
            return (
              <Grid item xs={12} sm={6} md={3} key={t}>
                <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                  <Chip
                    label={TIPO_TO_LABEL[t]}
                    sx={{
                      backgroundColor: TIPO_TO_COLOR[t],
                      color: t === 'recordatorio' ? 'rgba(0,0,0,0.87)' : '#fff',
                      fontWeight: 700,
                      fontSize: 14,
                      px: 2,
                    }}
                  />
                </Box>
            
                <Grid container spacing={2}>
                  {items.length === 0 ? (
                    <Grid item xs={12}>
                      <Typography variant="body2">
                        No hay plantillas para {TIPO_TO_LABEL[t]}
                      </Typography>
                    </Grid>
                  ) : (
                    <PlantillaComponent items={items} />
                  )}
                </Grid>
              </Grid>
            );
          })}
        </Grid>
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