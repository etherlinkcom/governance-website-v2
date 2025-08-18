import { prettifyKey } from '@/lib/prettifyKey';
import { observer } from 'mobx-react-lite';
import { useTableSort } from '@/hooks/useTableSort';
import { SortableTable, SortableTableSkeleton } from '@/components/shared/SortableTable';
import { Vote } from '@trilitech/types';
import { formatNumber } from '@/lib/formatNumber';
import { Link, Typography } from '@mui/material';
import { contractStore } from '@/stores/ContractStore';

const voterKeys: (keyof Vote)[] = ['baker', 'voting_power', 'vote', 'time'];

interface VotersTableProps {
  proposalHash: string;
}

// TODO pass contractAddress + contractVotingIndex to fetch votes for specific period
export const VotersTable = observer(({ proposalHash }: VotersTableProps) => {
  const { votes, isLoading } = contractStore.getVotesForProposal(proposalHash);

  const { sortedData, order, orderBy, handleRequestSort } = useTableSort(
    votes,
    'baker',
  );

  const columns = voterKeys.map(key => ({
    id: key,
    label: key === 'proposal_hash' ? 'Proposal' : prettifyKey(key),
    sortable: true
  }));

  const renderCell = (row: Vote, column: { id: keyof Vote; label: string; sortable?: boolean }) => {
    switch (column.id) {
      case 'baker':
        return (
          <Link
            href={`${process.env.NEXT_PUBLIC_TZKT_URL}/${row.transaction_hash}`}
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
            component='span'
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

  if (!Array.isArray(votes) || votes.length === 0 || isLoading) {
    return <SortableTableSkeleton columns={columns} rowCount={5} />;
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