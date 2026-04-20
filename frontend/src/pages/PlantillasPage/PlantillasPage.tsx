import React from 'react';
import {
  Box,
  GridLegacy as Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
} from '@mui/material';

import { AlertMessage } from '../../common/components';
import PlantillaComponent from './components/PlantillaComponent';

import { usePlantillas }  from './usePlantillas';
import { TIPO_KEYS } from './utilsPlantillas';

// ---------------------- Sub-componente: card de selección ----------------------
interface Props {
  contenido: string;
  updating: boolean;
  onAssign: () => void;
}

function PlantillaCard({ contenido, updating, onAssign }: Props): React.ReactElement {
  return (
    <Card
      sx={{
        borderRadius: 3,
        border: '2px solid rgba(0,0,0,0.12)',
        boxShadow: 3,
        display: 'flex',
        flexDirection: 'column',
        p: 2,
        minHeight: 230,
        maxWidth: 320,
        cursor: updating ? 'default' : 'pointer',
        justifyContent: 'space-between',
        alignItems: 'stretch',
        transition: 'transform 0.2s',
        opacity: updating ? 0.7 : 1,
        '&:hover': updating ? {} : { transform: 'scale(1.02)', boxShadow: 6 },
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
          {contenido}
        </Typography>
      </CardContent>

      <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', p: 2 }}>
        <Button
          size="small"
          variant="contained"
          onClick={onAssign}
          disabled={updating}
        >
          Asignar
        </Button>
      </Box>
    </Card>
  );
}

// ---------------------- Componente principal ----------------------
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
                  // Permitimos vacío o valores dentro del rango para tipeo fluido
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
            {plantillas.map((plantilla) => (
              <Grid item xs={12} sm={6} md={4} key={plantilla.id}>
                <PlantillaCard
                  contenido={plantilla.contenido}
                  updating={updating}
                  onAssign={() => handleCardAssign(plantilla.id)}
                />
              </Grid>
            ))}
          </Grid>
        </>
      ) : (
        <Grid container spacing={2}>
          {TIPO_KEYS.map((t) => (
            <PlantillaComponent key={t} items={grouped[t] ?? []} />
          ))}
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