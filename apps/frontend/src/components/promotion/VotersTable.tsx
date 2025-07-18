import { Table, TableHead, TableRow, TableCell, TableBody, useTheme, Typography, Link, Box } from '@mui/material';
import { ComponentLoading } from '@/components/shared/ComponentLoading';
import { prettifyKey } from '@/lib/prettifyKey';
import { observer } from 'mobx-react-lite';
import { usePeriodData } from '@/hooks/usePeriodData';
import { useTableSort } from '@/hooks/useTableSort';
import { SortableTable } from '@/components/shared/SortableTable';
import { Vote } from '@trilitech/types';
import { customSortComparator, formatNumber } from '@/lib/votingCalculations';

const voterKeys: (keyof Vote)[] = ['baker', 'voting_power', 'vote', 'time'];

const VotersTableSkeleton = () => {
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
            {voterKeys.map(key => (
              <TableCell key={key} sx={{ whiteSpace: 'nowrap' }}>
                {prettifyKey(key)}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {[...Array(5)].map((_, rowIdx) => (
            <TableRow key={rowIdx}>
              {voterKeys.map((key, colIdx) => (
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

interface VotersTableProps {
  contractVotingIndex?: number;
  contractAddress?: string;
}

export const VotersTable = observer(({ contractVotingIndex, contractAddress }: VotersTableProps) => {
  const { votes, isLoading, error, hasValidParams } = usePeriodData(contractAddress, contractVotingIndex);

  const { sortedData, order, orderBy, handleRequestSort } = useTableSort(
    votes,
    'baker',
    customSortComparator
  );

  if (!hasValidParams) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
        No voters found
      </Typography>
    );
  }

  if (isLoading) return <VotersTableSkeleton />;

  if (error) {
    return (
      <Typography variant="body2" color="error" sx={{ textAlign: 'center', py: 3 }}>
        Error loading voters: {error}
      </Typography>
    );
  }

  const columns = voterKeys.map(key => ({
    id: key,
    label: prettifyKey(key),
    sortable: true
  }));

  const renderCell = (row: Vote, column: { id: keyof Vote; label: string; sortable?: boolean }) => {
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
        return formatNumber(row.voting_power)
      case 'vote':
        return (
          <Typography
            sx={{
              textTransform: 'capitalize',
              fontWeight: 'bold',
              color:
                row.vote === 'yea' ? 'success.main' :
                row.vote === 'nay' ? 'error.main' :
                'warning.main'
            }}
          >
            {row.vote}
          </Typography>
        );
      case 'time':
        return new Date(row.time).toLocaleString();
      default:
        return String(row[column.id] || '');
    }
  };

  if (!Array.isArray(votes) || votes.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
        {contractVotingIndex
          ? `No voters found for period ${contractVotingIndex}`
          : 'No voters found'
        }
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