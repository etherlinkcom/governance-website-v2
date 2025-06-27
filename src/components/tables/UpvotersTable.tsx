import { useTableSort } from '@/hooks.ts/useTableSort';
import { customSortComparator } from '@/utils/votingPowerUtils';
import { useTheme } from '@mui/material/styles';
import { Typography } from '@mui/material';
import SortableTable from './SortableTable';

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
  const theme = useTheme();
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
        return (
          <Typography variant='link'>
            {row.baker}
          </Typography>
        );
      case 'votingPower':
        return row.votingPower;
      case 'proposal':
        return row.proposal;
      case 'time':
        return row.time;
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