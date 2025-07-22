import { useTableSort } from '@/hooks/useTableSort';
import { Table, TableHead, TableRow, TableCell, TableBody, Typography, useTheme, Link, Box } from '@mui/material';
import { SortableTable } from '@/components/shared/SortableTable';
import { ComponentLoading } from '@/components/shared/ComponentLoading';
import { prettifyKey } from '@/lib/prettifyKey';
import { observer } from 'mobx-react-lite';
import { Upvote } from '@trilitech/types';
import { usePeriodData } from '@/hooks/usePeriodData';
import { customSortComparator, formatNumber } from '@/lib/votingCalculations';
import { HashDisplay } from '../shared/HashDisplay';

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

  // TODO can be moved to sortable table component
  const columns = upvoterKeys.map(key => ({
    id: key,
    label: key === 'proposal_hash' ? 'Proposal' : prettifyKey(key),
    sortable: true
  }));

  // TODO can be moved to sortable table component
  const renderCell = (row: Upvote, column: { id: keyof Upvote; label: string; sortable?: boolean }) => {
    switch (column.id) {
      case 'baker':
        return (
          <Link
            href={`${process.env.NEXT_PUBLIC_TZKT_API_URL}/${row.baker}`}
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
          <HashDisplay hash={row.proposal_hash} />
        );
      case 'time':
        return new Date(row.time).toLocaleString();
      default:
        return String(row[column.id] || '');
    }
  };

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