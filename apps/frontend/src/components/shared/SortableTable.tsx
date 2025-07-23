import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TableSortLabel, Box } from '@mui/material';

type Order = 'asc' | 'desc';

interface Column<T> {
  id: keyof T;
  label: string;
  sortable?: boolean;
}

interface SortableTableProps<T> {
  columns: Column<T>[];
  data: T[];
  order: Order;
  orderBy: keyof T;
  onRequestSort: (property: keyof T) => void;
  renderCell: (row: T, column: Column<T>) => React.ReactNode;
}

export const SortableTable = <T,>({ columns, data, order, orderBy, onRequestSort, renderCell }: SortableTableProps<T>) => {
  return (
    <Box sx={{ width: '100%' }}>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id as string}
                  sx={{
                    minWidth: 0,
                    maxWidth: 80,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    wordBreak: 'keep-all'
                  }}
                >
                  {column.sortable ? (
                    <TableSortLabel
                      active={orderBy === column.id}
                      direction={orderBy === column.id ? order : 'asc'}
                      onClick={() => onRequestSort(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => (
              <TableRow key={index}>
                {columns.map((column) => (
                  <TableCell
                    key={column.id as string}
                    sx={{
                      minWidth: 0,
                      maxWidth: 80,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {renderCell(row, column)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};