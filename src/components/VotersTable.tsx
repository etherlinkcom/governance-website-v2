import { Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SortableTable from './SortableTable';
import { useTableSort } from '@/hooks.ts/useTableSort';
import { customSortComparator } from '@/utils/votingPowerUtils';

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
        return <span className="baker-cell">{row.baker}</span>;
      case 'votingPower':
        return <span className="voting-power-cell">{row.votingPower}</span>;
      case 'vote':
        return <Typography sx={{ color: theme.palette.primary.main }}>{row.vote}</Typography>;
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

export default VotersTable;