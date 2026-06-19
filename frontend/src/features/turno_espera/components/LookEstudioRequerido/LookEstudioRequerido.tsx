import {
  Box,
  Button,
  Typography,
  CircularProgress,
  Paper,
  Alert,
  Stack,
  TextField,
  Chip,
  InputAdornment,
  IconButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import type { Estudio} from "../../types";
import { useLookEstudioRequerido } from "./useLookEstudioRequerido";
import type { Setter } from "@/common/types";

interface Props {
  estudioRequerido: Estudio[];
  setEstudioRequerido: Setter<Estudio[]>;
  setFinishEstudioRequerido: Setter<boolean>;
}

export default function LookEstudioRequerido(props: Props) {
  const {
    estudios,
    selectedIds,
    loading,
    error,
    query,
    setQuery,
    filtered,
    handleConfirm,
    handleClear,
    toggleEstudio,
  } = useLookEstudioRequerido(props);

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", p: 1 }}>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Seleccionar estudios requeridos
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Button variant="contained" onClick={handleConfirm} disabled={loading}>
            Confirmar
          </Button>

          <Button
            variant="outlined"
            onClick={handleClear}
            disabled={loading || estudios.length === 0}
          >
            Limpiar
          </Button>

          <TextField
            size="small"
            placeholder="Buscar estudios..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: query ? (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setQuery("")}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ) : undefined,
            }}
            sx={{ minWidth: 320, ml: 1 }}
          />
        </Stack>
      </Box>

      {error && (
        <Box sx={{ mb: 2 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
          <CircularProgress />
        </Box>
      ) : estudios.length > 0 ? (
        <Paper variant="outlined" sx={{ p: 1 }}>
          <Box
            sx={{
              display: "flex",
              gap: 1,
              overflowX: "auto",
              whiteSpace: "nowrap",
              py: 1,
              px: 0.5,
            }}
          >
            {filtered.map((e) => (
              <Chip
                key={e.id}
                label={e.nombre}
                color={selectedIds.includes(e.id) ? "primary" : "default"}
                onClick={() => toggleEstudio(e.id)}
                sx={{ cursor: "pointer" }}
              />
            ))}
          </Box>
        </Paper>
      ) : (
        !error && (
          <Box sx={{ mt: 2 }}>
            <Alert severity="info">No hay estudios disponibles.</Alert>
          </Box>
        )
      )}
    </Box>
  );
}