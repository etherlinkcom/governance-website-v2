import { Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useTableSort } from '@/hooks.ts/useTableSort';
import { customSortComparator } from '@/utils/votingPowerUtils';
import SortableTable from './SortableTable';

interface Voter {
  baker: string;
  votingPower: string;
  vote: string;
  time: string;
}

interface VotersTableProps {
  voters: Voter[];
}

const VotersTable = ({ voters }: VotersTableProps) => {
  const theme = useTheme();

  const { sortedData, order, orderBy, handleRequestSort } = useTableSort(
    voters,
    'baker',
    customSortComparator
  );

  const columns = [
    { id: 'baker' as keyof Voter, label: 'Baker', sortable: true },
    { id: 'votingPower' as keyof Voter, label: 'Voting power', sortable: true },
    { id: 'vote' as keyof Voter, label: 'Vote', sortable: true },
    { id: 'time' as keyof Voter, label: 'Time', sortable: true }
  ];

  const renderCell = (row: Voter, column: { id: keyof Voter; label: string; sortable?: boolean }) => {
    switch (column.id) {
      case 'baker':
        return (
          <Typography variant='link'>
            {row.baker}
          </Typography>
        );
      case 'votingPower':
        return row.votingPower;
      case 'vote':
        return (
          <span style={{
            color: theme.palette.primary.main,
            fontWeight: '600'
          }}>
            {row.vote}
          </span>
        );
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

export default VotersTable;