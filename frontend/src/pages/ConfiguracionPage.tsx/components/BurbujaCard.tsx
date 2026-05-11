import { Card, CardContent, Typography } from "@mui/material";

interface Props {
  name: string;
  selected: boolean;
  onClick: () => void;
  color: string
}



export function BurbujaCard({ name, selected, onClick, color }: Props) {
  return (
    <Card
      onClick={onClick}
      sx={{
        p: 2,
        borderRadius: 5,
        textAlign: 'center',
        cursor: 'pointer',
        minHeight: 14,
        maxHeight: 18,
        width: 'auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        boxShadow: 4,
        border: '2px solid rgba(0,0,0,0.12)',
        bgcolor: selected ? color : 'white',
        transition: 'background-color 200ms, border-color 200ms, box-shadow 200ms, transform 120ms',
        '&:hover': { borderColor: 'primary.main', boxShadow: 6, transform: 'translateY(-4px)' },
        '&:active': { transform: 'translateY(-1px)' },
        '&:focus-visible': {
          outline: 'none',
          borderColor: 'primary.main',
          boxShadow: '0 0 0 4px rgba(25,118,210,0.12)',
        },
        ...(selected && {
          borderColor: 'primary.main',
          boxShadow: 6,
          transform: 'translateY(-4px)',
        }),
      }}
    >
    <CardContent >
    <Typography variant="body2" sx={{ fontSize: 13 }}>
          {name}
      </Typography>
    </CardContent>
    </Card>
  );
}