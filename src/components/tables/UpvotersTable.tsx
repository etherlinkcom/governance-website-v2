import { useTableSort } from '@/hooks/useTableSort';
import { customSortComparator } from '@/utils/votingPowerUtils';
import { Table, TableHead, TableRow, TableCell, TableBody, Typography, useTheme } from '@mui/material';
import SortableTable from './SortableTable';
import ComponentLoading from '@/components/shared/ComponentLoading';
import { prettifyKey } from '@/utils/prettifyKey';
import { contractStore } from '@/stores/ContractStore';
import { observer } from 'mobx-react-lite';

interface Upvoter {
  baker: string;
  votingPower: string;
  proposal: string;
  time: string;
}

const upvoterKeys: (keyof Upvoter)[] = ['baker', 'votingPower', 'proposal', 'time'];

const UpvotersTableSkeleton = () => {
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
            {upvoterKeys.map(key => (
              <TableCell key={key}>
                {prettifyKey(key)}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {[...Array(5)].map((_, rowIdx) => (
            <TableRow key={rowIdx}>
              {upvoterKeys.map((key, colIdx) => (
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

const UpvotersTable = observer(() => {
  const {upvoters, isLoading} = contractStore;
  const { sortedData, order, orderBy, handleRequestSort } = useTableSort(
    upvoters,
    'baker',
    customSortComparator
  );

  if (isLoading) return <UpvotersTableSkeleton />;

  const columns = upvoterKeys.map(key => ({
    id: key,
    label: prettifyKey(key),
    sortable: true
  }));

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
});


export default UpvotersTable;