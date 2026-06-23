import {GridLegacy as Grid, InputLabel, FormControl, Select, MenuItem }from '@mui/material'
import { EfectorForm } from '@/features/efector/components/EfectorForm';
import type { Efector, Especialidad } from '@/features/efector/types';
import type { Setter } from '@/common/types';
import type { SelectChangeEvent } from "@mui/material";

type SortBy = "priority" | "dias";


type Props = {
    efectores: Efector[]
    selectedEfector: Efector | null
    setSelectedEfector: Setter<Efector | null>
    selectedEspecialidad: number | null
    setSelectedEspecialidad: Setter<number | null>
    especialidadesOptions: Especialidad[]
    selectedDerivacion: Efector | null
    setSelectedDerivacion: Setter<Efector | null>
    derivaciones: Efector[]
    sortBy: SortBy
    setSortBy: Setter<SortBy>
    selectedOrigen: number | null
    setSelectedOrigen: Setter<number | null>
    origenesOptions: Efector[]
}
export const FilterListaEspera = ({ efectores, selectedEfector, setSelectedEfector, selectedEspecialidad, setSelectedEspecialidad,
                                    especialidadesOptions, selectedDerivacion, setSelectedDerivacion, derivaciones, sortBy, setSortBy,
                                selectedOrigen, setSelectedOrigen, origenesOptions}: Props) => {
    

    return (
    <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Grid item xs={12} sm={4} md={2.4}>
          <EfectorForm
            efectores={efectores}
            selectedEfector={selectedEfector}
            setSelectedEfector={setSelectedEfector}
          />
        </Grid>

        <Grid item xs={12} sm={4} md={2.4}>
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

        <Grid item xs={12} sm={6} md={2.4}>
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

        <Grid item xs={12} sm={6} md={2.4}>
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

        <Grid item xs={12} sm={4} md={2.4}>
            <FormControl size="small" fullWidth>
                <InputLabel sx={{ fontSize: 13 }}>Origen</InputLabel>
                <Select
                    value={String(selectedOrigen) ?? ""}
                    label="Origen"
                    onChange={(e: SelectChangeEvent) =>
                    setSelectedOrigen(e.target.value === "" ? null : Number(e.target.value))
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
                {origenesOptions.map((s) => (
                    <MenuItem key={s.id} value={s.id} sx={{ fontSize: 13 }}>
                    {s.nombre}
                    </MenuItem>
                ))}
                </Select>
            </FormControl>
        </Grid>
    </Grid>
    )
}