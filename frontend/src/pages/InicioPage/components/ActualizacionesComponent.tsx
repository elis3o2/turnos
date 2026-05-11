import { useState } from "react";
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Divider,
  ListItem,
  Typography,
} from "@mui/material";
import { ACTUALIZACIONES } from "../utilsMensajeDashboard";

export function ActualizacionComponent() {
  const [openUpdates, setOpenUpdates] = useState(false);

  return (<>
    <Button 
        size="small"
        sx={{ borderRadius: 99, border: "1.5px solid",
             borderColor: "primary.main", bgcolor: "primary.50" }}
        onClick={() => setOpenUpdates(true)}>
        Novedades
    </Button>


      <Dialog
        open={openUpdates}
        onClose={() => setOpenUpdates(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
        >
          Novedades del SMT  -- 11/05/2026
        </DialogTitle>

        <DialogContent dividers>
          {ACTUALIZACIONES.map((item, i, arr) => (
            <Box key={i}>
              <ListItem
                alignItems="flex-start"
                disableGutters
                sx={{ flexDirection: "column", py: 1.5 }}
              >
                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                  {item.titulo}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {item.detalle}
                </Typography>
              </ListItem>
              {i < arr.length - 1 && <Divider />}
            </Box>
          ))}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={() => setOpenUpdates(false)}
            variant="contained"
            size="small"
          >
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}