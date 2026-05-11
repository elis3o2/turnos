type Props = {
  value?: string | Date | null;
};

import { Box, Typography } from "@mui/material";

export const DateTimeStack = ({ value }: Props) => {
  if (!value) return null;

  let formattedDate = "";
  let formattedTime = "";

  if (typeof value === "string") {
    // yyyy-mm-dd hh:mm:ss o ISO
    const match = value.match(
      /^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})/
    );

    if (!match) return null;

    const [, year, month, day, hour, minute] = match;

    formattedDate = `${day}-${month}-${year}`;
    formattedTime = `${hour}:${minute}`;
  } else {
    // Date real
    if (isNaN(value.getTime())) return null;

    formattedDate = value
      .toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        timeZone: "UTC",
      })
      .replace(/\//g, "-");

    formattedTime = value.toLocaleTimeString("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "UTC",
    });
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
      <Typography sx={{ fontSize: 11, lineHeight: 1 }}>
        {formattedDate}
      </Typography>

      <Typography sx={{ fontSize: 11, lineHeight: 1 }}>
        {formattedTime}
      </Typography>
    </Box>
  );
};