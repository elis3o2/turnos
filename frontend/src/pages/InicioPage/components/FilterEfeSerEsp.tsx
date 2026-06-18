import { useState } from "react";
import { Menu, MenuItem, ListItemText, Checkbox, ListItemIcon } from "@mui/material";
import HospitalIcon from '@/assets/hospital.png'
import AidKitIcon from '@/assets/first-aid-kit.png'
import MedicalReportIcon from '@/assets/medical-report.png'
import { FilterIcon } from "./FilterIcon";
import type { Efector, Especialidad, Servicio } from "@/features/efector/types";
import type { Setter } from "@/common/types";

type Props = {
    efectores: Efector[] | undefined
    selectedEfectores: number[]
    setSelectedEfectores: Setter<number[]>
    servicios: Servicio[]
    selectedServicios: number[]
    setSelectedServicios: Setter<number[]>
    especialidades: Especialidad[]
    selectedEspecialidades: number[]
    setSelectedEspecialidades: Setter<number[]>
    availableServicios: number[]
    availableEspecialidades: number[]
}


export const FilterEfeSerEsp = ({ efectores, selectedEfectores, setSelectedEfectores, servicios, selectedServicios,
                                setSelectedServicios, especialidades, selectedEspecialidades, setSelectedEspecialidades,
                                availableServicios, availableEspecialidades} : Props) => {
 
    const [anchorEfector, setAnchorEfector] = useState<null | HTMLElement>(null)
    const [anchorServicio, setAnchorServicio] = useState<null | HTMLElement>(null)
    const [anchorEspecialidad, setAnchorEspecialidad] = useState<null | HTMLElement>(null)
    
    const handleToggleEfector = (id: number) =>
        setSelectedEfectores(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])

    const handleToggleServicio = (id: number) =>
        setSelectedServicios(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])

    const handleToggleEspecialidad = (id: number) =>
        setSelectedEspecialidades(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id])

    const removeChip = (setter: React.Dispatch<React.SetStateAction<number[]>>, id: number) =>
        setter(prev => prev.filter(x => x !== id))

    const isServicioDisabled = selectedEfectores.length === 0
    const isEspecialidadDisabled = selectedServicios.length === 0


    return ( <>
    <FilterIcon
        src={HospitalIcon}
        label="efectores"
        disabled={false}
        onClick={e => setAnchorEfector(e.currentTarget)}
        chips={
        selectedEfectores.length === 0
            ? [{ id: -1, label: 'Todos los efectores' }]
            : selectedEfectores.map(id => ({
                id,
                label: efectores?.find(e => e.id === id)?.nombre ?? String(id),
                onDelete: () => removeChip(setSelectedEfectores, id),
            }))
        }
    />

    <Menu
        anchorEl={anchorEfector}
        open={Boolean(anchorEfector)}
        onClose={() => setAnchorEfector(null)}
        PaperProps={{ style: { maxHeight: 320, minWidth: 260 } }}
    >
        <MenuItem onClick={() => { setSelectedEfectores([]); setAnchorEfector(null) }}>
        <ListItemText>Todos los efectores</ListItemText>
        </MenuItem>
        {efectores?.map(e => (
        <MenuItem key={e.id} onClick={() => handleToggleEfector(e.id)}>
            <ListItemIcon>
            <Checkbox edge="start" checked={selectedEfectores.includes(e.id)} />
            </ListItemIcon>
            <ListItemText>{e.nombre}</ListItemText>
        </MenuItem>
        ))}
    </Menu>

    <FilterIcon
        src={MedicalReportIcon}
        label="servicios"
        disabled={isServicioDisabled}
        onClick={e => { if (!isServicioDisabled) setAnchorServicio(e.currentTarget) }}
        chips={
        selectedServicios.length === 0
            ? [{ id: -1, label: 'Todos los servicios' }]
            : selectedServicios.map(id => ({
                id,
                label: servicios.find(s => s.id === id)?.nombre ?? String(id),
                onDelete: () => removeChip(setSelectedServicios, id),
            }))
        }
    />

    <Menu
        anchorEl={anchorServicio}
        open={Boolean(anchorServicio)}
        onClose={() => setAnchorServicio(null)}
        PaperProps={{ style: { maxHeight: 360, minWidth: 280 } }}
    >
        <MenuItem onClick={() => { setSelectedServicios([]); setAnchorServicio(null) }}>
        <ListItemText>Todos los servicios</ListItemText>
        </MenuItem>
        {servicios.filter(s => availableServicios.includes(s.id)).map(s => (
        <MenuItem key={s.id} onClick={() => handleToggleServicio(s.id)}>
            <ListItemIcon>
            <Checkbox edge="start" checked={selectedServicios.includes(s.id)} />
            </ListItemIcon>
            <ListItemText>{s.nombre}</ListItemText>
        </MenuItem>
        ))}
    </Menu>

    <FilterIcon
        src={AidKitIcon}
        label="especialidades"
        disabled={isEspecialidadDisabled}
        onClick={e => { if (!isEspecialidadDisabled) setAnchorEspecialidad(e.currentTarget) }}
        chips={
        selectedEspecialidades.length === 0
            ? [{ id: -1, label: 'Todas las especialidades' }]
            : selectedEspecialidades.map(id => ({
                id,
                label: especialidades.find(e => e.id === id)?.nombre ?? String(id),
                onDelete: () => removeChip(setSelectedEspecialidades, id),
            }))
        }
    />

    <Menu
        anchorEl={anchorEspecialidad}
        open={Boolean(anchorEspecialidad)}
        onClose={() => setAnchorEspecialidad(null)}
        PaperProps={{ style: { maxHeight: 360, minWidth: 320 } }}
    >
        <MenuItem onClick={() => { setSelectedEspecialidades([]); setAnchorEspecialidad(null) }}>
        <ListItemText>Todas las especialidades</ListItemText>
        </MenuItem>
        {especialidades.filter(e => availableEspecialidades.includes(e.id)).map(es => (
        <MenuItem key={es.id} onClick={() => handleToggleEspecialidad(es.id)}>
            <ListItemIcon>
            <Checkbox edge="start" checked={selectedEspecialidades.includes(es.id)} />
            </ListItemIcon>
            <ListItemText>{es.nombre}</ListItemText>
        </MenuItem>
        ))}
    </Menu>
    </>)
}