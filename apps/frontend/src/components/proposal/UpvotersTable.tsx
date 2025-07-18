import { useTableSort } from '@/hooks/useTableSort';
import { Table, TableHead, TableRow, TableCell, TableBody, Typography, useTheme, Link, Box } from '@mui/material';
import { SortableTable } from '@/components/shared/SortableTable';
import { ComponentLoading } from '@/components/shared/ComponentLoading';
import { prettifyKey } from '@/lib/prettifyKey';
import { observer } from 'mobx-react-lite';
import { Upvote } from '@trilitech/types';
import { usePeriodData } from '@/hooks/usePeriodData';
import { customSortComparator, formatNumber } from '@/lib/votingCalculations';

const upvoterKeys: (keyof Upvote)[] = ['baker', 'voting_power', 'proposal_hash', 'time'];

const UpvotersTableSkeleton = () => {
  const theme = useTheme();
  return (
    <Box sx={{
      width: '100%',
      overflowX: 'auto',
      borderRadius: '25px',
      background: theme.palette.background.paper,
    }}>
      <Table sx={{ minWidth: 600 }}>
        <TableHead>
          <TableRow>
            {upvoterKeys.map(key => (
              <TableCell key={key} sx={{ whiteSpace: 'nowrap' }}>
                {prettifyKey(key)}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {[...Array(5)].map((_, rowIdx) => (
            <TableRow key={rowIdx}>
              {upvoterKeys.map((key, colIdx) => (
                <TableCell key={colIdx} sx={{ whiteSpace: 'nowrap' }}>
                  <ComponentLoading width="80%" height={18} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

interface UpvotersTableProps {
  contractVotingIndex?: number;
  contractAddress?: string;
}

export const UpvotersTable = observer(({ contractVotingIndex, contractAddress }: UpvotersTableProps) => {
  const { upvoters, isLoading, error, hasValidParams } = usePeriodData(contractAddress, contractVotingIndex);

  const { sortedData, order, orderBy, handleRequestSort } = useTableSort(
    upvoters,
    'baker',
    customSortComparator
  );

  if (isLoading) return <UpvotersTableSkeleton />;

  if (error) {
    return (
      <Typography variant="body2" color="error" sx={{ textAlign: 'center', py: 3 }}>
        Error loading upvoters: {error}
      </Typography>
    );
  }

  const columns = upvoterKeys.map(key => ({
    id: key,
    label: prettifyKey(key),
    sortable: true
  }));

  const renderCell = (row: Upvote, column: { id: keyof Upvote; label: string; sortable?: boolean }) => {
    switch (column.id) {
      case 'baker':
        return (
          <Link
            href={`https://tzkt.io/${row.baker}`}
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              color: 'primary.main',
              textDecoration: 'none',
              '&:hover': {
                textDecoration: 'underline',
              },
            }}
          >
            {row.alias || row.baker}
          </Link>
        );
      case 'voting_power':
        return formatNumber(row.voting_power);
      case 'proposal_hash':
        return (
          <Typography
            variant="body2"
            sx={{
              fontFamily: 'monospace',
              fontSize: '0.75rem',
              maxWidth: 150,
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
          >
            {row.proposal_hash}
          </Typography>
        );
      case 'time':
        return new Date(row.time).toLocaleString();
      default:
        return String(row[column.id] || '');
    }
  };

  // Show empty state if no data
  if (!hasValidParams) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
        No upvoters found
      </Typography>
    );
  }

  return (
    <SortableTable
      columns={columns}
      data={sortedData}
      order={order}
      orderBy={orderBy}
      onRequestSort={handleRequestSort}
      renderCell={renderCell}
    />
  );
});