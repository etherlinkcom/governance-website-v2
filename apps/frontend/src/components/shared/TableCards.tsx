import { Paper, SxProps, Typography } from "@mui/material";
import { Column } from "./SortableTable";
import { Theme } from "@emotion/react";
import { Box } from "@mui/system";
import { ComponentLoading } from "./ComponentLoading";

interface TableCardsSkeletonProps<T> {
  columns: Column<T>[];
  rowCount?: number;
  sx?: SxProps<Theme>;
}

export const TableCardsSkeleton = <T,>({ columns, rowCount = 3, sx }: TableCardsSkeletonProps<T>) => (
  <Box sx={{
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    ...sx
  }}>
    {[...Array(rowCount)].map((_, index) => (
      <Paper className="table-card" key={index}>
        {columns.map((column) => (
          <Box key={column.id as string} sx={{ mb: 1 }}>
            <Typography variant="subtitle2">
                {column.label}
            </Typography>
            <Typography variant="body2">
              <ComponentLoading width="100%" />
            </Typography>
          </Box>
        ))}
      </Paper>
    ))}
  </Box>
);

interface TableCardsProps<T> {
  columns: Column<T>[];
  data: T[];
  renderCell: (row: T, column: Column<T>) => React.ReactNode;
  sx?: SxProps<Theme>;
}

export const TableCards = <T,>({ columns, data, renderCell, sx }: TableCardsProps<T>) => (
  <Box sx={{
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      ...sx
    }}>
    {data.map((row, index) => (
      <Paper className="table-card" key={index}>
        {columns.map((column) => (
          <Box key={column.id as string} sx={{ mb: 1 }}>
            <Typography variant="subtitle2">{column.label}</Typography>
            <Typography variant="body2">{renderCell(row, column)}</Typography>
          </Box>
        ))}
      </Paper>
    ))}
  </Box>
);