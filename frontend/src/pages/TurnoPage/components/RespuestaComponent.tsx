import {Box, Button, Paper, Typography,} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import type { RespuestaCategory } from '../../../features/informix/types';

type Props = {
  activeRespuestaCategory: RespuestaCategory | null;
  loading: boolean;
  handleSelectCategory: (cat: RespuestaCategory) => void;
};

export const RespuestaComponent = ({
  activeRespuestaCategory,
  loading,
  handleSelectCategory,
}: Props) => {

  const isActive = (cat: RespuestaCategory) => activeRespuestaCategory === cat;
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

          <Typography fontWeight={700}>Respuestas</Typography>

        </Box>

        {/* RIGHT */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Categorías */}
            <Button
              size="small"
              variant={isActive('confirmados') ? 'contained' : 'outlined'}
              disabled={loading}
              onClick={() => handleSelectCategory('confirmados')}
              sx={{
                borderColor: '#2e7d32',
                color: isActive('confirmados') ? '#fff' : '#2e7d32',
                backgroundColor: isActive('confirmados') ? '#2e7d32' : 'transparent',
                '&:hover': {
                  backgroundColor: isActive('confirmados') ? '#2e7d32' : '#2e7d3218',
                  borderColor: '#2e7d32',
                },
              }}
            >
              Confirmados
            </Button>

            <Button
              size="small"
              variant={isActive('rechazados') ? 'contained' : 'outlined'}
              disabled={loading}
              onClick={() => handleSelectCategory('rechazados')}
              sx={{
                borderColor: '#c62828',
                color: isActive('rechazados') ? '#fff' : '#c62828',
                backgroundColor: isActive('rechazados') ? '#c62828' : 'transparent',
                '&:hover': {
                  backgroundColor: isActive('rechazados') ? '#c62828' : '#c6282818',
                  borderColor: '#c62828',
                },
              }}
            >
              Rechazados
            </Button>

            <Button
              size="small"
              variant={isActive('incorrectos') ? 'contained' : 'outlined'}
              disabled={loading}
              onClick={() => handleSelectCategory('incorrectos')}
              sx={{
                borderColor: '#e65100',
                color: isActive('incorrectos') ? '#fff' : '#e65100',
                backgroundColor: isActive('incorrectos') ? '#e65100' : 'transparent',
                '&:hover': {
                  backgroundColor: isActive('incorrectos') ? '#e65100' : '#e6510018',
                  borderColor: '#e65100',
                },
              }}
            >
              Incorrectos
            </Button>

            <Button
              size="small"
              variant={isActive('sin_respuesta') ? 'contained' : 'outlined'}
              disabled={loading}
              onClick={() => handleSelectCategory('sin_respuesta')}
              sx={{
                borderColor: '#1565c0',
                color: isActive('sin_respuesta') ? '#fff' : '#1565c0',
                backgroundColor: isActive('sin_respuesta') ? '#1565c0' : 'transparent',
                '&:hover': {
                  backgroundColor: isActive('sin_respuesta') ? '#1565c0' : '#1565c018',
                  borderColor: '#1565c0',
                },
              }}
            >
              Sin respuesta
            </Button>
          </Box>
      </Paper>
    </Box>
  );
};