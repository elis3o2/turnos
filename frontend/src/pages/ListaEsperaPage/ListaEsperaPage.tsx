import {
  Box,
  CircularProgress,
  Typography,
  Paper,
  Stack,
  Button,
} from "@mui/material";
import { AlertMessage } from "@/common/components/AlertMessage";
import DetalleTurno from "./components/DetalleTurno/DetalleTurno";
import ListaEsperaComponent from "@/features/turno_espera/components/ListaEsperaComponent";
import { useListaEspera } from "./useListaEspera";
import { FilterListaEspera } from "./components/FilterListaEspera";


export default function ListaEsperaPage(): React.ReactElement {
  const {
    efectores,
    permiso,
    selectedEfector,
    setSelectedEfector,
    selectedEspecialidad,
    setSelectedEspecialidad,
    loading,
    derivaciones,
    selectedDerivacion,
    setSelectedDerivacion,
    selectedOrigen,
    setSelectedOrigen,
    sortBy,
    setSortBy,
    openDialog,
    activeTurno,
    selectedEstudios,
    alertOpen,
    setAlertOpen,
    alertMsg,
    alertSeverity,
    especialidadesOptions,
    origenesOptions,
    visibleTurnos,
    isRemoving,
    handleToggleEstudio,
    handleGuardarEstudios,
    handleOpenDialog,
    handleCloseDialog,
    handleRemove,
    handleGoToAddEspera,
    handleGoToBuscarPaciente,
  } = useListaEspera();

  return (
    <Box sx={{ p: 3, maxWidth: 1100, mx: "auto" }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6">Lista de espera</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          {permiso && <Button 
            size="small"
            variant="contained"
            disableElevation
            onClick={handleGoToAddEspera}
            disabled={!selectedEfector}
          >
            Agregar
          </Button>}
          <Button
            size="small"
            variant="contained"
            disableElevation
            onClick={handleGoToBuscarPaciente}
          >
            Buscar Paciente
          </Button>
        </Box>
      </Box>

      <FilterListaEspera
        efectores={efectores}
        selectedEfector={selectedEfector}
        setSelectedEfector={setSelectedEfector}
        selectedEspecialidad={selectedEspecialidad}
        setSelectedEspecialidad={setSelectedEspecialidad}
        especialidadesOptions={especialidadesOptions}
        selectedDerivacion={selectedDerivacion}
        setSelectedDerivacion={setSelectedDerivacion}
        derivaciones={derivaciones}
        sortBy={sortBy}
        setSortBy={setSortBy}
        selectedOrigen={selectedOrigen}
        setSelectedOrigen={setSelectedOrigen}
        origenesOptions={origenesOptions}
      />

      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", mb: 1 }}>
        {loading ? (
          <Stack direction="row" spacing={1} alignItems="center">
            <CircularProgress size={18} />
            <Typography variant="body2">Cargando...</Typography>
          </Stack>
        ) : selectedEfector ? (
          <Typography variant="body2">{visibleTurnos.length} turnos visibles</Typography>
        ) : (
          <Typography variant="body2" color="text.secondary">
            Seleccione un efector
          </Typography>
        )}
      </Box>

      {!selectedEfector ? (
        <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">
            Seleccione un efector para ver los turnos en espera.
          </Typography>
        </Paper>
      ) : visibleTurnos.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 3, textAlign: "center" }}>
          <Typography color="text.secondary">
            No hay turnos que coincidan con los filtros.
          </Typography>
        </Paper>
      ) : (
        <ListaEsperaComponent
          visibleTurnos={visibleTurnos}
          handleOpenDialog={handleOpenDialog}
        />
      )}

      <DetalleTurno
        permiso={permiso}
        activeTurno={activeTurno}
        openDialog={openDialog}
        handleCloseDialog={handleCloseDialog}
        selectedEstudios={selectedEstudios}
        handleToggleEstudio={handleToggleEstudio}
        handleGuardarEstudios={handleGuardarEstudios}
        selectedDerivacion={selectedDerivacion?.id ?? null}
        handleRemove={handleRemove}
        isRemoving={isRemoving}
      />

      <AlertMessage
        open={alertOpen}
        handleClose={() => setAlertOpen(false)}
        message={alertMsg}
        severity={alertSeverity}
      />
    </Box>
  );
}