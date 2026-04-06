import { Stack, Typography } from "@mui/material";
type Props = {
  value?: string | Date | null;
};

export const DateStack = ({ value }: Props) => {
  if (!value) return null;

  const date = value instanceof Date ? value : new Date(value);

  const formattedDate = date
    .toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
    .replace(/\//g, "-");


  return (
    <Stack >
        {formattedDate}
    </Stack>
  );
};