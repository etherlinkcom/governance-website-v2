import { Table, TableHead, TableRow, TableCell, TableBody, useTheme, Typography } from '@mui/material';
import ComponentLoading from '@/components/shared/ComponentLoading';
import { prettifyKey } from '@/utils/prettifyKey';
import { observer } from 'mobx-react-lite';
import { contractStore } from '@/stores/ContractStore';
import { useTableSort } from '@/hooks/useTableSort';
import { customSortComparator } from '@/utils/votingPowerUtils';
import SortableTable from './SortableTable';


interface Voter {
  baker: string;
  votingPower: string;
  vote: string;
  time: string;
}

const voterKeys: (keyof Voter)[] = ['baker', 'votingPower', 'vote', 'time'];

const VotersTableSkeleton = () => {
  const theme = useTheme();

  return (
    <div style={{
      boxShadow: `0px 0px 6px 0px ${theme.palette.custom.shadow.primary}`,
      borderRadius: '25px',
      overflow: 'hidden',
      padding: '12px',
      background: theme.palette.background.paper,
    }}>
      <Table>
        <TableHead>
          <TableRow>
            {voterKeys.map(key => (
              <TableCell key={key}>
                {prettifyKey(key)}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {[...Array(5)].map((_, rowIdx) => (
            <TableRow key={rowIdx}>
              {voterKeys.map((key, colIdx) => (
                <TableCell key={colIdx}>
                  <ComponentLoading width="80%" height={18} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

const VotersTable = observer(() => {
  const theme = useTheme();
  const { promotion, isLoading } = contractStore;

  const { sortedData, order, orderBy, handleRequestSort } = useTableSort(
    promotion?.voters || [],
    'baker',
    customSortComparator
  );

  if (isLoading) return <VotersTableSkeleton />;

  const columns = voterKeys.map(key => ({
    id: key,
    label: prettifyKey(key),
    sortable: true
  }));

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
          <span style={{ // TODO typography
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
});

export default VotersTable;