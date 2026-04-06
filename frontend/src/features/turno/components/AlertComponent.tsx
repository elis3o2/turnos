import React from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Typography,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

// 👇 tipado correcto
type AlertCategory = 'rechazados' | 'incorrectos' | 'sin_respuesta';

type AlertData = {
  count_total: number;
  grupos: {
    rechazados: any[];
    incorrectos: any[];
    sin_respuesta: any[];
  };
};

type Props = {
  alertData: AlertData | null;
  alertLoading: boolean;
  alertMode: boolean;
  activeAlertCategory: AlertCategory;

  setActiveAlertCategory: React.Dispatch<React.SetStateAction<AlertCategory>>;
  handleToggleAlertMode: () => void;

};

export const AlertaComponent = ({
  alertData,
  alertLoading,
  alertMode,
  activeAlertCategory,
  setActiveAlertCategory,
  handleToggleAlertMode,
}: Props) => {
  return (
    <Box sx={{ p: 2 }}>
      <Paper
        elevation={3}
        sx={{
          p: 1,
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
        }}
      >
        {/* LEFT */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningAmberIcon sx={{ color: 'warning.main' }} />

          <Typography fontWeight={700}>Alerta</Typography>

          <Typography variant="caption" sx={{ ml: 1 }}>
            {alertLoading
              ? 'cargando...'
              : alertData
              ? `${alertData.count_total} turnos en total`
              : '—'}
          </Typography>
        </Box>

        {/* RIGHT */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Categorías */}
          <Box sx={{ display: 'flex', gap: 0.5 }}>
            <Button
              size="small"
              variant={activeAlertCategory === 'rechazados' ? 'contained' : 'outlined'}
              onClick={() => setActiveAlertCategory('rechazados')}
            >
              RECHAZADOS {alertData ? `(${alertData.grupos.rechazados.length})` : ''}
            </Button>

            <Button
              size="small"
              variant={activeAlertCategory === 'incorrectos' ? 'contained' : 'outlined'}
              onClick={() => setActiveAlertCategory('incorrectos')}
            >
              INCORRECTOS {alertData ? `(${alertData.grupos.incorrectos.length})` : ''}
            </Button>

            <Button
              size="small"
              variant={activeAlertCategory === 'sin_respuesta' ? 'contained' : 'outlined'}
              onClick={() => setActiveAlertCategory('sin_respuesta')}
            >
              SIN RESPUESTA {alertData ? `(${alertData.grupos.sin_respuesta.length})` : ''}
            </Button>
          </Box>

          {/* Botón ALERTA */}
          <Button
            startIcon={<WarningAmberIcon />}
            color={alertMode ? 'warning' : 'inherit'}
            variant={alertMode ? 'contained' : 'outlined'}
            onClick={handleToggleAlertMode}
            disabled={alertLoading}
            size="small"
          >
            {alertLoading ? (
              <CircularProgress size={18} />
            ) : (
              `ALERTA ${alertData ? `(${alertData.count_total})` : ''}`
            )}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};