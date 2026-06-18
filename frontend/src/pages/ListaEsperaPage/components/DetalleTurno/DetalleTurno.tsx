import { Button, CircularProgress, Dialog, DialogActions } from "@mui/material";
import type { EstudioRequerido, TurnoEspera } from "@/features/turno_espera/types";
import { useDetalleTurno } from "./useDetalleTurno";
import { DetalleTurnoHeader } from "./DetalleTurnoHeader";
import { DetalleTurnoInfo } from "./DetalleTurnoInfo";

interface Props {
  permiso: boolean,
  activeTurno: TurnoEspera | null;
  openDialog: boolean;
  handleCloseDialog: () => void;
  selectedEstudios: number[];
  handleToggleEstudio: (e: EstudioRequerido) => void;
  handleGuardarEstudios: () => void;
  selectedDerivacion: number | null;
  handleRemove: () => void;
  isRemoving: (id?: number | null) => boolean;
}

export default function DetalleTurno({ permiso, activeTurno, openDialog, handleCloseDialog, selectedEstudios, 
                        handleToggleEstudio, handleGuardarEstudios, selectedDerivacion, handleRemove, isRemoving }: Props) {
  const {
    puedeEliminar,
    tienePendientes,
    deshabilitarGuardar,
    isRemovingActual,
  } = useDetalleTurno({
    activeTurno,
    selectedEstudios,
    selectedDerivacion,
    isRemoving,
  });


  return (
    <Dialog
      open={openDialog}
      onClose={handleCloseDialog}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.08)",
        },
      }}
    >
      {/* Header con fondo de color */}
      <DetalleTurnoHeader
        activeTurno={activeTurno}
      />

      <DetalleTurnoInfo
        activeTurno={activeTurno}
        permiso={permiso}
        selectedEstudios={selectedEstudios}
        handleToggleEstudio={handleToggleEstudio}
      />

      {/* Footer */}
      <DialogActions
        sx={{
          px: 3,
          py: 2,
          borderTop: "0.5px solid",
          borderColor: "divider",
          gap: 1,
          bgcolor: "background.paper",
        }}
      >
        {puedeEliminar && permiso && (
          <Button
            color="error"
            variant="outlined"
            onClick={handleRemove}
            disabled={isRemovingActual}
            startIcon={isRemovingActual ? <CircularProgress size={14} /> : null}
            size="small"
            sx={{ borderRadius: 2, mr: "auto" }}
          >
            Sacar de lista de espera
          </Button>
        )}

        <Button
          onClick={handleCloseDialog}
          size="small"
          sx={{ borderRadius: 2, color: "text.secondary" }}
        >
          Cerrar
        </Button>

        {tienePendientes && permiso && (
          <Button
            variant="contained"
            onClick={handleGuardarEstudios}
            disabled={deshabilitarGuardar}
            size="small"
            sx={{
              borderRadius: 2,
              bgcolor: "#185FA5",
              "&:hover": { bgcolor: "#0C447C" },
              boxShadow: "none",
            }}
          >
            Guardar estudios
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}