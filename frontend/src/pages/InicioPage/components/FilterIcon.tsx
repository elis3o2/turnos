import { Stack, Box, IconButton, Chip } from "@mui/material"

interface ChipItem {
  id: number
  label: string
  onDelete?: () => void
}

interface Props {
  src: string
  label: string
  disabled: boolean
  onClick: (e: React.MouseEvent<HTMLElement>) => void
  chips: ChipItem[]
}



export function FilterIcon({ src, label, disabled, onClick, chips }: Props) {
  return (
    <Box sx={{ textAlign: 'center' }}>
      <IconButton
        onClick={onClick}
        sx={{
          width: 100,
          height: 100,
          borderRadius: 3,
          filter: disabled ? 'brightness(0.65) saturate(0.4)' : 'none',
          cursor: disabled ? 'default' : 'pointer',
          transition: 'filter 0.2s',
        }}
        aria-label={label}
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
      >
        <img src={src} alt={label} width={56} height={56} />
      </IconButton>

      <Stack
        direction="row"
        spacing={0.5}
        justifyContent="center"
        sx={{ mt: 1, flexWrap: 'wrap', maxWidth: 220 }}
      >
        {chips.map(chip => (
          <Chip
            key={chip.id}
            label={chip.label}
            size="small"
            onDelete={chip.onDelete}
            sx={{ backgroundColor: '#1976d2', color: 'white', my: 0.25 }}
          />
        ))}
      </Stack>
    </Box>
  )
}