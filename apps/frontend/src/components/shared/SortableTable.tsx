import { theme } from '@/theme';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TableSortLabel, Box, alpha} from '@mui/material';
import { ComponentLoading } from './ComponentLoading';
import { TableCards, TableCardsSkeleton } from './TableCards';
import { getWalletStore } from '@/stores/WalletStore';

type Order = 'asc' | 'desc';

export interface Column<T> {
  id: keyof T;
  label: string;
  sortable?: boolean;
}

interface SortableTableSkeletonProps {
  columns: Column<any>[];
  rowCount?: number;
}

export const SortableTableSkeleton = ({ columns, rowCount = 5 }: SortableTableSkeletonProps) => {
  return (
    <Box sx={{ width: '100%', overflowX: 'auto', borderRadius: '25px', background: theme.palette.background.paper }}>
      <Table sx={{ minWidth: 600, display: { xs: 'none', sm: 'table' } }}>
        <TableHead>
          <TableRow>
            {columns.map(column => (
              <TableCell key={column.id as string} sx={{ whiteSpace: 'nowrap' }}>
                {column.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {[...Array(rowCount)].map((_, rowIdx) => (
            <TableRow key={rowIdx}>
              {columns.map((column, colIdx) => (
                <TableCell key={colIdx} sx={{ whiteSpace: 'nowrap' }}>
                  <ComponentLoading width="80%" height={18} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <TableCardsSkeleton columns={columns} sx={{ display: { xs: 'block', sm: 'none' } }} />
    </Box>
  );
};

interface SortableTableProps<T> {
  columns: Column<T>[];
  data: T[];
  order: Order;
  orderBy: keyof T;
  onRequestSort: (property: keyof T) => void;
  renderCell: (row: T, column: Column<T>) => React.ReactNode;
}

export const SortableTable = <T,>({ columns, data, order, orderBy, onRequestSort, renderCell }: SortableTableProps<T>) => {
  const walletStore = getWalletStore();
  return (
    <Box sx={{ width: '100%' }}>
      <TableContainer component={Paper} sx={{ display: { xs: 'none', sm: 'block' }, minWidth: 320 }}>
        <Table stickyHeader>
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
            {data.map((row: any, index) => (
              <TableRow key={index}
                sx={
                  Object.values(row).some(
                    value => walletStore?.isVoter(value as string))
                    ? { backgroundColor: `${alpha(theme.palette.primary.light, 0.1)} !important` }
                    : {}
                }>
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
      <TableCards<T> columns={columns} data={data} renderCell={renderCell} sx={{ display: { xs: 'block', sm: 'none' } }} />
    </Box>
  );
};