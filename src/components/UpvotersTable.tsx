import { customSortComparator } from '@/utils/votingPowerUtils';
import SortableTable from './SortableTable';
import { useTableSort } from '@/hooks.ts/useTableSort';

interface Upvoter {
  baker: string;
  votingPower: string;
  proposal: string;
  time: string;
}

interface UpvotersTableProps {
  upvoters: Upvoter[];
}

const UpvotersTable = ({ upvoters }: UpvotersTableProps) => {
  const { sortedData, order, orderBy, handleRequestSort } = useTableSort(
    upvoters,
    'baker',
    customSortComparator
  );

  const columns = [
    { id: 'baker' as keyof Upvoter, label: 'Baker', sortable: true },
    { id: 'votingPower' as keyof Upvoter, label: 'Voting power', sortable: true },
    { id: 'proposal' as keyof Upvoter, label: 'Proposal', sortable: true },
    { id: 'time' as keyof Upvoter, label: 'Time', sortable: true }
  ];

  const renderCell = (row: Upvoter, column: { id: keyof Upvoter; label: string; sortable?: boolean }) => {
    switch (column.id) {
      case 'baker':
        return <span className="baker-cell">{row.baker}</span>;
      case 'votingPower':
        return <span className="voting-power-cell">{row.votingPower}</span>;
      case 'proposal':
        return <span className="proposal-cell">{row.proposal}</span>;
      case 'time':
        return <span className="time-cell">{row.time}</span>;
      default:
        return row[column.id];
    }
  };

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
};

export default UpvotersTable;