import { Card, CardContent, Typography } from "@mui/material"

export function StatCard({label, value,}: {label: string, value: number}) {
  return (
    <Card
      sx={{
        flex: '1 1 220px',
        minWidth: 220,
        textAlign: 'center',
        borderRadius: 4,
        boxShadow: 4,
        p: 1,
      }}
    >
      <CardContent>
        <Typography variant="overline" color="text.secondary" letterSpacing={2}>
          {label}
        </Typography>
        <Typography variant="h3" fontWeight={700} sx={{ mt: 1 }}>
          {value.toLocaleString()}
        </Typography>
      </CardContent>
    </Card>
  )
}