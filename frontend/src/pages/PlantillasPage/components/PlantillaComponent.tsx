import { Box, Chip, Card, CardContent, Typography, GridLegacy as Grid, } from "@mui/material";
import type { Plantilla } from "../../../features/mensaje/types";

interface Props {
  items: Plantilla[];
}

export default function PlantillaComponent({ items }: Props) {
  return (
    <Grid container spacing={2}>
      {items.length === 0 ? (
        <Grid item xs={12}>
          <Typography variant="body2">No hay plantillas cargadas</Typography>
        </Grid>
      ) : (
        items.map((plantilla) => (
          <Grid item xs={12} sm={6} md={3} key={plantilla.id}>
            <Card
              sx={{
                borderRadius: 3,
                border: "2px solid rgba(0,0,0,0.12)",
                boxShadow: 3,
                minHeight: 120,
                transition: "transform 0.2s",
                "&:hover": { transform: "scale(1.02)", boxShadow: 6 },
              }}
            >
              <CardContent>
                <Box sx={{ mb: 2 }}>
                  <Chip
                    label={plantilla.tipo}
                    sx={{
                      backgroundColor: "#1976d2",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: 14,
                      px: 2,
                    }}
                  />
                </Box>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ whiteSpace: "pre-wrap" }}
                >
                  {plantilla.contenido}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))
      )}
    </Grid>
  );
}