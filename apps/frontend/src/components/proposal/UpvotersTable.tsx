import { useTableSort } from '@/hooks/useTableSort';
import { Typography, Link } from '@mui/material';
import { SortableTable, SortableTableSkeleton } from '@/components/shared/SortableTable';
import { prettifyKey } from '@/lib/prettifyKey';
import { observer } from 'mobx-react-lite';
import { Upvote } from '@trilitech/types';
import { customSortComparator } from '@/lib/votingCalculations';
import { HashDisplay } from '../shared/HashDisplay';
import { formatNumber } from '@/lib/formatNumber';
import { contractStore } from '@/stores/ContractStore';

const upvoterKeys: (keyof Upvote)[] = ['baker', 'voting_power', 'proposal_hash', 'time'];

interface UpvotersTableProps {
  contractVotingIndex?: number;
  contractAddress?: string;
}

export const UpvotersTable = observer(({ contractVotingIndex, contractAddress }: UpvotersTableProps) => {
  const { upvoters, isLoading, error, hasValidParams } = contractStore.getPeriodData(contractAddress, contractVotingIndex);

  const { sortedData, order, orderBy, handleRequestSort } = useTableSort(
    upvoters,
    'baker',
    customSortComparator
  );

  const columns = upvoterKeys.map(key => ({
    id: key,
    label: key === 'proposal_hash' ? 'Proposal' : prettifyKey(key),
    sortable: true
  }));

  if (isLoading) return <SortableTableSkeleton columns={columns} />;

  if (error) {
    return (
      <Typography variant="body2" color="error" sx={{ textAlign: 'center', py: 3 }}>
        Error loading upvoters: {error}
      </Typography>
    );
  }


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