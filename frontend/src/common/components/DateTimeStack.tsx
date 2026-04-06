import { Stack, Typography } from "@mui/material";
type Props = {
  value?: string | Date | null;
};

export const DateTimeStack = ({ value }: Props) => {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);
  if (isNaN(date.getTime())) return null;

  const formattedDate = date
    .toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    .replace(/\//g, "-");

  const formattedTime = date.toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false, 
  });

  return (
    <Stack spacing={0}>
      <Typography variant="caption">
        {formattedDate}
      </Typography>
      <Typography variant="caption">
        {formattedTime}
      </Typography>
    </Stack>
  );
};