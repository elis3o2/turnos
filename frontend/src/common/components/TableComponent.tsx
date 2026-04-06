import {
  Typography,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Box,
  Paper
} from "@mui/material";

import { motion } from "framer-motion";

import type { KeySLabel } from "../types";

type Props<T> = {
  columns: KeySLabel[];
  visibleColumns: string[];
  data: T[];
  loading?: boolean;

  renderCell: (key: string, row: T) => React.ReactNode;

  emptyMessage?: string;
};

export function TableComponent<T>({
  columns,
  visibleColumns,
  data,
  loading = false,
  renderCell,
  emptyMessage = "No hay datos",
}: Props<T>) {
  
  const visible = columns.filter(c => visibleColumns.includes(c.key));
  const MotionTableRow = motion(TableRow);

  return (
    <TableContainer component={Paper} elevation={4}>
      <Table stickyHeader size="small">
        
        {/* HEADER */}
        <TableHead>
          <TableRow>
            {visible.map(col => (
              <TableCell key={col.key} sx={{ fontWeight: 700 }}>
                {col.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        {/* BODY */}
        <TableBody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {visible.map(col => (
                  <TableCell key={col.key}>...</TableCell>
                ))}
              </TableRow>
            ))
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={visible.length}>
                <Box sx={{ p: 3, textAlign: "center" }}>
                  <Typography>{emptyMessage}</Typography>
                </Box>
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, i) => (
              <MotionTableRow
                key={(row as any).id ?? i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {visible.map(col => (
                  <TableCell key={col.key}>
                    <Typography variant="body">
                    {renderCell(col.key, row)}
                    </Typography>
                  </TableCell>
                ))}
              </MotionTableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}