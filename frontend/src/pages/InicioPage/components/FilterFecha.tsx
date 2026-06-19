import { Stack, TextField } from "@mui/material"
import type { Setter } from "@/common/types"

type Props = {
    selectedDesde: string | null
    setSelectedDesde: Setter<string | null>
    selectedHasta: string | null 
    setSelectedHasta: Setter<string | null>
}

export const FilterFecha = ({ selectedDesde, setSelectedDesde, selectedHasta, setSelectedHasta}: Props) => {
    return (
    <Stack direction="row" spacing={2} alignItems="center">
        <TextField
        label="Desde"
        type="date"
        size="small"
        value={selectedDesde}
        onChange={e => setSelectedDesde(e.target.value)}
        inputProps={{ max: selectedHasta }}
        InputLabelProps={{ shrink: true }}
        sx={{ width: 155 }}
        />
        <TextField
        label="Hasta"
        type="date"
        size="small"
        value={selectedHasta}
        onChange={e => setSelectedHasta(e.target.value)}
        inputProps={{ min: selectedDesde }}
        InputLabelProps={{ shrink: true }}
        sx={{ width: 155 }}
        />
    </Stack>
    )
}