import { useTableSort } from '@/hooks/useTableSort';
import { Typography, Link } from '@mui/material';
import { SortableTable, SortableTableSkeleton } from '@/components/shared/SortableTable';
import { prettifyKey } from '@/lib/prettifyKey';
import { observer } from 'mobx-react-lite';
import { Upvote } from '@trilitech/types';
import { HashDisplay } from '@/components/shared/HashDisplay';
import { formatNumber } from '@/lib/formatNumber';
import { contractStore } from '@/stores/ContractStore';

const upvoterKeys: (keyof Upvote)[] = ['baker', 'voting_power', 'proposal_hash', 'time'];

interface UpvotersTableProps {
  contractVotingIndex?: number;
  contractAddress?: string;
}

export const UpvotersTable = observer(({ proposalHash }: {proposalHash: string}) => {
  const { upvotes, isLoading } = contractStore.getUpvotesForProposal(proposalHash);

  const { sortedData, order, orderBy, handleRequestSort } = useTableSort(
    upvotes,
    'baker',
  );

  const columns = upvoterKeys.map(key => ({
    id: key,
    label: key === 'proposal_hash' ? 'Proposal' : prettifyKey(key),
    sortable: true
  }));


  const renderCell = (row: Upvote, column: { id: keyof Upvote; label: string; sortable?: boolean }) => {
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
        return formatNumber(row.voting_power);
      case 'proposal_hash':
        return (
          <HashDisplay hash={row.proposal_hash} sx={{overflow: 'hidden', textOverflow: 'ellipsis'}} />
        );
      case 'time':
        return new Date(row.time).toLocaleString();
      default:
        return String(row[column.id] || '');
    }
  };

  if (isLoading) return <SortableTableSkeleton columns={columns} />;

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