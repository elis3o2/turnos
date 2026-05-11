import { useMemo } from "react";
import React from "react";
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

const MotionTableRow = motion(TableRow);

type Props<T> = {
  columns: readonly KeySLabel[];
  visibleColumns: string[];
  data: T[];
  loading?: boolean;
  renderCell: (key: string, row: T) => React.ReactNode;
  emptyMessage?: string;
};

export const TableComponent = React.memo(function TableComponent<T>({
  columns,
  visibleColumns,
  data,
  loading = false,
  renderCell,
  emptyMessage = "No hay datos",
}: Props<T>) {

  const visible = useMemo(
    () => columns.filter(c => visibleColumns.includes(c.key)),
    [columns, visibleColumns]
  );

  return (
    <TableContainer component={Paper} elevation={2}>
    <Table
      stickyHeader
      size="small"
      sx={{
        '& .MuiTableCell-root': {
          py: 0.5,
          px: 1,
          fontSize: 13,
          height: 50,
          minHeight: 50,
          boxSizing: 'border-box',
        },
        '& .MuiTableRow-root': {
          height: 50,
        },
      }}
    >
        <TableHead>
          <TableRow>
            {visible.map(col => (
              <TableCell
                key={col.key}
                sx={{
                  fontWeight: 600,
                  fontSize: 12,
                  py: 0.5,
                  backgroundColor: 'background.paper',
                }}
              >
                {col.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

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
                <Box sx={{ p: 2, textAlign: "center" }}>
                  <Typography sx={{ fontSize: 13 }}>
                    {emptyMessage}
                  </Typography>
                </Box>
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, i) => (
              <MotionTableRow
                key={(row as any).id ?? i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ backgroundColor: 'rgba(0,0,0,0.03)' }} 
              >
                {visible.map(col => (
                <TableCell key={col.key}>
                  <Box sx={{ fontSize: 12 }}>
                    {renderCell(col.key, row)}
                  </Box>
                </TableCell>
                ))}
              </MotionTableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
});