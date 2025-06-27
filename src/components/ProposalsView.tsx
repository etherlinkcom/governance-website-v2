import { Box, Typography, Card, CardContent, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, TableSortLabel } from '@mui/material';
import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { contractStore } from '@/stores/ContractStore';

type Order = 'asc' | 'desc';
type OrderBy = 'baker' | 'votingPower' | 'proposal' | 'time';

const ProposalsView = observer(() => {
  const { proposals, upvoters, quorum, loading, error } = contractStore;
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<OrderBy>('baker');

  const handleRequestSort = (property: OrderBy) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedUpvoters = upvoters.slice().sort((a, b) => {
    let aValue: string | number = a[orderBy];
    let bValue: string | number = b[orderBy];

    if (orderBy === 'votingPower') {
      const parseVotingPower = (value: string) => {
        const num = parseFloat(value);
        const multiplier = value.includes('T') ? 1000000000000 :
                          value.includes('B') ? 1000000000 : 1;
        return num * multiplier;
      };
      aValue = parseVotingPower(a.votingPower);
      bValue = parseVotingPower(b.votingPower);
    }

    if (orderBy === 'time') {
      aValue = new Date(a.time).getTime();
      bValue = new Date(b.time).getTime();
    }

    if (bValue < aValue) {
      return order === 'asc' ? 1 : -1;
    }
    if (bValue > aValue) {
      return order === 'asc' ? -1 : 1;
    }
    return 0;
  });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ color: 'error.main' }}>
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Proposals Section */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h2" sx={{ color: 'text.primary' }}>
            Proposals
          </Typography>
          <Typography variant="body2" sx={{ color: 'primary.main' }}>
            Quorum: {quorum}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {proposals.map((proposal) => (
            <Card
              key={proposal.id}
              sx={{
                backgroundColor: 'background.paper',
                boxShadow: '0px 0px 6px 0px #38FF9C66',
                border: 'none',
                borderRadius: '8px',
                '&:hover': {
                  boxShadow: '0px 0px 10px 2px #38FF9C66',
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s ease-in-out',
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: 'monospace',
                        color: 'text.secondary',
                        fontSize: '0.75rem',
                        mb: 1,
                        wordBreak: 'break-all'
                      }}
                    >
                      {proposal.id}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                      (by {proposal.author})
                    </Typography>
                    {proposal.title && (
                      <Typography variant="h6" sx={{ color: 'primary.main', textDecoration: 'underline' }}>
                        {proposal.title}
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                      Upvotes:
                    </Typography>
                    <Typography variant="h6" sx={{ color: 'text.primary' }}>
                      {proposal.upvotes}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Box>

      {/* Upvoters Section */}
      <Box>
        <Typography variant="h5" component="h2" sx={{ color: 'text.primary', mb: 2 }}>
          Upvoters
        </Typography>

        <TableContainer component={Paper} sx={{ backgroundColor: 'background.paper' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'baker'}
                    direction={orderBy === 'baker' ? order : 'asc'}
                    onClick={() => handleRequestSort('baker')}
                  >
                    Baker
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'votingPower'}
                    direction={orderBy === 'votingPower' ? order : 'asc'}
                    onClick={() => handleRequestSort('votingPower')}
                  >
                    Voting power
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'proposal'}
                    direction={orderBy === 'proposal' ? order : 'asc'}
                    onClick={() => handleRequestSort('proposal')}
                  >
                    Proposal
                  </TableSortLabel>
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={orderBy === 'time'}
                    direction={orderBy === 'time' ? order : 'asc'}
                    onClick={() => handleRequestSort('time')}
                  >
                    Time
                  </TableSortLabel>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sortedUpvoters.map((upvoter, index) => (
                <TableRow key={index}>
                  <TableCell className="baker-cell">
                    {upvoter.baker}
                  </TableCell>
                  <TableCell className="voting-power-cell">
                    {upvoter.votingPower}
                  </TableCell>
                  <TableCell className="proposal-cell">
                    {upvoter.proposal}
                  </TableCell>
                  <TableCell className="time-cell">
                    {upvoter.time}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Box>
  );
});

export default ProposalsView;