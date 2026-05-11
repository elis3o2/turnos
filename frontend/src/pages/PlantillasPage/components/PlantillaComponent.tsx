import React from 'react';
import {
  Box,
  GridLegacy as Grid,
  Card,
  CardContent,
  Typography,
  Button,
} from '@mui/material';
import type { Plantilla } from '../../../features/mensaje/types';

// ─── Tipos ────────────────────────────────────────────────────────────────────

// Modo visualización: solo items
interface ViewModeProps {
  items: Plantilla[];
  updating?: never;
  onAssign?: never;
}

// Modo modificación: items + updating + onAssign
interface EditModeProps {
  items: Plantilla[];
  updating: boolean;
  onAssign: (id: number) => void;
}

type Props = ViewModeProps | EditModeProps;

// ─── Componente ───────────────────────────────────────────────────────────────
export default function PlantillaComponent({ items, updating, onAssign }: Props): React.ReactElement {
  const isEditMode = onAssign !== undefined;

  return (
    <>
      {items.map((plantilla: Plantilla) => (
        <Grid
          item
          xs={12}
          sm={isEditMode ? 6 : 12}
          md={isEditMode ? 4 : 12}
          key={plantilla.id}
        >
          <Card
            sx={{
              borderRadius: 3,
              border: '2px solid rgba(0,0,0,0.12)',
              boxShadow: 3,
              display: 'flex',
              flexDirection: 'column',
              p: 2,
              minHeight: isEditMode ? 230 : 120,
              ...(isEditMode && { maxWidth: 320 }),
              cursor: isEditMode ? (updating ? 'default' : 'pointer') : 'default',
              justifyContent: isEditMode ? 'space-between' : 'center',
              alignItems: isEditMode ? 'stretch' : 'center',
              transition: 'transform 0.2s',
              opacity: isEditMode && updating ? 0.7 : 1,
              '&:hover': isEditMode && !updating
                ? { transform: 'scale(1.02)', boxShadow: 6 }
                : !isEditMode
                  ? { transform: 'scale(1.02)', boxShadow: 6 }
                  : {},
            }}
          >
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                {plantilla.contenido}
              </Typography>
            </CardContent>

            {isEditMode && (
              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', p: 2 }}>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => !updating && onAssign(plantilla.id)}
                  disabled={updating}
                >
                  Asignar
                </Button>
              </Box>
            )}
          </Card>
        </Grid>
      ))}
    </>
  );
}