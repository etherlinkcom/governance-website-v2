import { prettifyKey } from '@/lib/prettifyKey';
import { observer } from 'mobx-react-lite';
import { useTableSort } from '@/hooks/useTableSort';
import { SortableTable, SortableTableSkeleton } from '@/components/shared/SortableTable';
import { Vote } from '@trilitech/types';
import { customSortComparator} from '@/lib/votingCalculations';
import { formatNumber } from '@/lib/formatNumber';
import { Link, Typography } from '@mui/material';
import { contractStore } from '@/stores/ContractStore';

const voterKeys: (keyof Vote)[] = ['baker', 'voting_power', 'vote', 'time'];

interface VotersTableProps {
  contractVotingIndex?: number;
  contractAddress?: string;
}

export const VotersTable = observer(({ contractVotingIndex, contractAddress }: VotersTableProps) => {
  const { votes, isLoading, error, hasValidParams } = contractStore.getPeriodData(contractAddress, contractVotingIndex);

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

  const columns = voterKeys.map(key => ({
    id: key,
    label: key === 'proposal_hash' ? 'Proposal' : prettifyKey(key),
    sortable: true
  }));

  if (isLoading) return <SortableTableSkeleton columns={columns} />;

  if (error) {
    return (
      <Typography variant="body2" color="error" sx={{ textAlign: 'center', py: 3 }}>
        Error loading voters: {error}
      </Typography>
    );
  }


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