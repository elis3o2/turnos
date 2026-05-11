import {
  Box,
  Button,
  CircularProgress,
  GridLegacy as Grid,
  IconButton,
  Pagination,
  Paper,
  Stack,
  TextField,
} from "@mui/material";

import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import ViewColumnIcon   from "@mui/icons-material/ViewColumn";
import GetAppIcon       from "@mui/icons-material/GetApp";
import RefreshIcon      from "@mui/icons-material/Refresh";
import MenuBookIcon     from "@mui/icons-material/MenuBook";

import { TableComponent } from "../../common/components/TableComponent";
import { ColumnSelector } from "../../common/components/ColumnSelector";
import { EfectorListForm } from "../../features/efector/components/EfectorListForm";
import { ServicioListForm } from "../../features/efector/components/ServicioListForm";

import { useTurno } from "./useTurno";
import { ALL_COLUMNS, renderCell} from "./utilsTurnos";
import { RespuestaComponent } from "./components/RespuestaComponent";

export default function TurnosPage() {
  const {
    navigate,
    efectores,
    turnos,
    loading,
    downloading,
    page,
    totalPages,
    hasSearched,
    servicios,
    selectedEfectores,    setSelectedEfectores,
    selectedServicios,    setSelectedServicios,
    fechaDesde,           setFechaDesde,
    fechaHasta,           setFechaHasta,
    visibleColumns,       setVisibleColumns,
    anchorCols,           setAnchorCols,
    errorMode,
    activeRespuestaCategory,
    handleBuscar,
    handleDescargar,
    handleChangePage,
    handleToggleErrorMode,
    handleSelectCategory,
  } = useTurno();

  return (
    <Box sx={{ p: 2 }}>
      <RespuestaComponent
        activeRespuestaCategory={activeRespuestaCategory}
        loading={loading}
        handleSelectCategory={handleSelectCategory}
      />

      <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">

          <Grid item xs={12} md={4}>
            {efectores ? (
              <EfectorListForm
                efectores={efectores}
                selectedEfectores={selectedEfectores}
                setSelectedEfectores={setSelectedEfectores}
              />
            ) : "-"}
          </Grid>

          <Grid item xs={12} md={4}>
            <ServicioListForm
              servicios={servicios}
              selectedServicios={selectedServicios}
              setSelectedServicios={setSelectedServicios}
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <TextField
              size="small"
              label="Desde"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={fechaDesde ?? ""}
              onChange={(e) => setFechaDesde(e.target.value || null)}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} md={2}>
            <TextField
              size="small"
              label="Hasta"
              type="date"
              InputLabelProps={{ shrink: true }}
              value={fechaHasta ?? ""}
              onChange={(e) => setFechaHasta(e.target.value || null)}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>

              <Button
                startIcon={<RefreshIcon />}
                variant="outlined"
                onClick={handleBuscar}
                disabled={loading}
                size="small"
              >
                {loading ? <CircularProgress size={18} /> : "Buscar"}
              </Button>

              <Button
                startIcon={<WarningAmberIcon />}
                variant={errorMode ? "contained" : "outlined"}
                color={errorMode ? "error" : "inherit"}
                onClick={handleToggleErrorMode}
                disabled={loading}
                size="small"
              >
                Error mensajes
              </Button>

              <Button
                startIcon={downloading ? <CircularProgress size={16} /> : <GetAppIcon />}
                variant="contained"
                onClick={handleDescargar}
                disabled={loading || downloading || !hasSearched || turnos.length === 0}
                size="small"
              >
                Descargar
              </Button>

              <IconButton
                onClick={(e) => setAnchorCols(e.currentTarget)}
                size="small"
                title="Columnas"
              >
                <ViewColumnIcon fontSize="small" />
              </IconButton>

              <ColumnSelector
                columns={ALL_COLUMNS}
                value={visibleColumns}
                onChange={setVisibleColumns}
                anchorEl={anchorCols}
                onClose={() => setAnchorCols(null)}
              />

              <IconButton
                onClick={() => navigate("/historico")}
                size="small"
                title="Histórico"
              >
                <MenuBookIcon fontSize="small" />
              </IconButton>

            </Box>
          </Grid>
        </Grid>
      </Paper>


      <TableComponent
        columns={ALL_COLUMNS}
        visibleColumns={visibleColumns}
        data={turnos}
        loading={loading}
        renderCell={renderCell as (key: string, row: unknown) => React.ReactNode}
      />
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 1 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Pagination
            count={totalPages}
            page={page}
            onChange={handleChangePage}
            color="primary"
            siblingCount={1}
            boundaryCount={1}
            showFirstButton
            showLastButton
          />
        </Stack>
      </Box>
    </Box>
  );
}