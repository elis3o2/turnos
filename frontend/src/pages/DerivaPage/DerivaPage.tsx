import { useContext, useEffect, useMemo, useState } from "react";
import {
  Box,
  Paper,
  Stack,
  Typography,
  Chip,
  Tooltip,
  Button
} from "@mui/material";
import { AuthContext } from "@/common/contex";
import { EfectorForm } from "@/features/efector/components/EfectorForm";

import type { Efector } from "@/features/efector/types";
import type { Deriva } from "@/features/efector/types";
import { getDerivaByEfector } from "@/features/efector/api";
import { AddDeriva } from "./AddDeriva";

export const DerivaPage = () => {
    const { efectores } = useContext(AuthContext) as { efectores: Efector[];};

    const [selectedEfector, setSelectedEfector] = useState<Efector | null>(null);
    const [derivaciones, setDerivaciones] = useState<Deriva[]>([]);
    const [agrega, setAgrega] = useState(false)

  useEffect(() => {
    if (!selectedEfector) {
      setDerivaciones([]);
      return;
    }

    const loadDerivaciones = async () => {
      try {
        const data = await getDerivaByEfector(selectedEfector.id);
        setDerivaciones(data);
      } catch (error) {
        console.error(error);
      }
    };

    loadDerivaciones();
  }, [selectedEfector]);

  const agrupado = useMemo(() => {
    const efectoresMap = new Map<
      number,
      {
        id: number;
        nombre: string;
        servicios: Map<number, { id: number; nombre: string; especialidades: Deriva[] }>;
      }
    >();

    derivaciones.forEach((d) => {
      const efectorId = d.efector_deriva.id;

      if (!efectoresMap.has(efectorId)) {
        efectoresMap.set(efectorId, {
          id: efectorId,
          nombre: d.efector_deriva.nombre,
          servicios: new Map(),
        });
      }

      const efector = efectoresMap.get(efectorId)!;
      const servicioId = d.servicio_deriva.id;

      if (!efector.servicios.has(servicioId)) {
        efector.servicios.set(servicioId, {
          id: servicioId,
          nombre: d.servicio_deriva.nombre,
          especialidades: [],
        });
      }

      efector.servicios.get(servicioId)!.especialidades.push(d);
    });

    return Array.from(efectoresMap.values());
  }, [derivaciones]);

  return (
    <Box>              
        <Button variant="outlined" onClick={() => setAgrega(true)}>
                Agregar
        </Button>
        {agrega && selectedEfector? <AddDeriva 
                efector={selectedEfector}
                derivaciones={derivaciones}/> 
                : <>
      <EfectorForm
        efectores={efectores}
        selectedEfector={selectedEfector}
        setSelectedEfector={setSelectedEfector}
      />

      <Stack spacing={2} sx={{ mt: 3 }}>
        {agrupado.map((efector) => {
          const serviciosArray = Array.from(efector.servicios.values());

          return (
            <Paper key={efector.id} variant="outlined" sx={{ p: 0, overflow: "hidden" }}>
            {/* Header azul */}
            <Box
                sx={{
                px: 2,
                py: 1.5,
                bgcolor: "primary.main",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                }}
            >
                <Typography variant="subtitle1" fontWeight={500} color="primary.contrastText">
                {efector.nombre}
                </Typography>

            </Box>

            {/* Cuerpo */}
            <Box sx={{ p: 2 }}>
                {serviciosArray.map((servicio) => (
                <Box key={servicio.id} mb={1.5}>
                    <Typography
                    variant="body2"
                    fontWeight={600}
                    color="text.secondary"
                    gutterBottom
                    >
                    {servicio.nombre}
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                    {servicio.especialidades.map((d) => (
                    <Tooltip title={d.cupo ? "CUPO" : ""} arrow>
                        <Chip
                            key={d.id}
                            label={d.especialidad_deriva.nombre}
                            size="small"
                            color={d.cupo ? "success" : "default"}
                            variant={d.cupo ? "filled" : "outlined"}
                        />
                    </Tooltip>
                    ))}
                    </Box>
                </Box>
                ))}
            </Box>
            </Paper>
          );
        })}
      </Stack>
      </>}
    </Box>
  );
};