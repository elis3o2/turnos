import { Stack } from "@mui/material";

type Props = {
  value?: string | Date | null;
};

export const DateStack = ({ value }: Props) => {
  if (!value) return null;

  let formattedDate = "";

  if (typeof value === "string") {
    // yyyy-mm-dd o ISO
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);

    if (!match) return null;

    const [, year, month, day] = match;

    formattedDate = `${day}-${month}-${year}`;
  } else {
    if (isNaN(value.getTime())) return null;

    formattedDate = value
      .toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone: "UTC",
      })
      .replace(/\//g, "-");
  }

  return <Stack>{formattedDate}</Stack>;
};