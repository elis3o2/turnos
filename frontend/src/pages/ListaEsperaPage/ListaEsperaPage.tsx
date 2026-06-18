import {
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Typography,
  Paper,
  Stack,
  Button,
  GridLegacy as Grid,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import { AlertMessage } from "@/common/components";
import DetalleTurno from "./components/DetalleTurno/DetalleTurno";
import { EfectorForm } from "@/features/efector/components/EfectorForm";
import ListaEsperaComponent from "@/features/turno_espera/components/ListaEsperaComponent";
import { useListaEspera } from "./useListaEspera";
import type { SortBy } from "./utilsListaEspra";


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
    <Box sx={{ p: 3, maxWidth: 1000, mx: "auto" }}>
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

      <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Grid item xs={12} sm={4} md={3}>
          <EfectorForm
            efectores={efectores}
            selectedEfector={selectedEfector}
            setSelectedEfector={setSelectedEfector}
          />
        </Grid>

        <Grid item xs={12} sm={4} md={3}>
          <FormControl size="small" fullWidth>
            <InputLabel sx={{ fontSize: 13 }}>Especialidad</InputLabel>
            <Select
              value={String(selectedEspecialidad) ?? ""}
              label="Especialidad"
              onChange={(e: SelectChangeEvent) =>
                setSelectedEspecialidad(e.target.value === "" ? null : Number(e.target.value))
              }
              sx={{
                fontSize: 13,
                height: 36,
                '& .MuiSelect-select': {
                  py: 0.5,
                },
              }}
            >
              <MenuItem value="" sx={{ fontSize: 13 }}>Todos</MenuItem>
              {especialidadesOptions.map((s) => (
                <MenuItem key={s.id} value={s.id} sx={{ fontSize: 13 }}>
                  {s.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <FormControl size="small" fullWidth>
            <InputLabel sx={{ fontSize: 13 }}>Ordenar por</InputLabel>
            <Select
              value={sortBy}
              label="Ordenar por"
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              sx={{
                fontSize: 13,
                height: 36,
                '& .MuiSelect-select': {
                  py: 0.5,
                },
              }}
            >
              <MenuItem value="priority" sx={{ fontSize: 13 }}>Prioridad</MenuItem>
              <MenuItem value="dias" sx={{ fontSize: 13 }}>Días en espera</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <FormControl size="small" fullWidth>
            <InputLabel sx={{ fontSize: 13 }}>Derivación</InputLabel>
            <Select
              value={selectedDerivacion ? String(selectedDerivacion.id) : ""}
              label="Derivación"
              onChange={(e: SelectChangeEvent) => {
                const val = e.target.value;
                setSelectedDerivacion(
                  val === "" ? null : derivaciones.find((x) => x.id === Number(val)) ?? null
                );
              }}
              sx={{
                fontSize: 13,
                height: 36,
                '& .MuiSelect-select': {
                  py: 0.5,
                },
              }}
            >
              <MenuItem value="" sx={{ fontSize: 13 }}>
                <em>Ninguna</em>
              </MenuItem>
              {derivaciones.map((ef) => (
                <MenuItem key={ef.id} value={ef.id} sx={{ fontSize: 13 }}>
                  {ef.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>

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