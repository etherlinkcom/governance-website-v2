import { Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress, TableSortLabel } from '@mui/material';
import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { contractStore } from '@/stores/ContractStore';

type Order = 'asc' | 'desc';
type OrderBy = 'baker' | 'votingPower' | 'vote' | 'time';

const PromotionView = observer(() => {
  const { promotion, loading, error } = contractStore;
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<OrderBy>('baker');

  const handleRequestSort = (property: OrderBy) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const sortedVoters = promotion?.voters.slice().sort((a, b) => {
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
  }) || [];

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

  if (!promotion) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6">
          No promotion data available
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Candidate Section */}
      <Box>
        <Box sx={{ mb: 2 }}>
          <Typography variant="label">
            Candidate{' '}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            {promotion.candidate}
          </Typography>
          <Typography variant="linkText">
            {promotion.title}
          </Typography>
        </Box>

        {/* Stats */}
        <Box sx={{ display: 'flex', gap: 4, mb: 3 }}>
          <Box>
            <Typography variant="label">
              Quorum:
            </Typography>
            <Typography variant="linkText" sx={{ fontWeight: 600 }}>
              {promotion.quorum}
            </Typography>
          </Box>
          <Box>
            <Typography variant="label">
              Supermajority:
            </Typography>
            <Typography variant="linkText" sx={{ fontWeight: 600 }}>
              {promotion.supermajority}
            </Typography>
          </Box>
        </Box>

        {/* Voting Results */}
        <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
          {/* Yea */}
          <Box
            sx={{
              flex: 1,
              border: '1px solid #38FF9C',
              borderRadius: '4px',
              p: 2,
              textAlign: 'center',
              backgroundColor: 'rgba(56, 255, 156, 0.1)'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
              <Box sx={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                backgroundColor: '#38FF9C',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Typography sx={{ fontSize: '12px', color: 'black' }}>✓</Typography>
              </Box>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {promotion.votes.yea.percentage}% ({promotion.votes.yea.count}{promotion.votes.yea.label})
              </Typography>
            </Box>
            <Typography variant="subtitle2">
              Yea
            </Typography>
          </Box>

          {/* Nay */}
          <Box
            sx={{
              flex: 1,
              border: '1px solid #FF6B6B',
              borderRadius: '4px',
              p: 2,
              textAlign: 'center',
              backgroundColor: 'rgba(255, 107, 107, 0.1)'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
              <Box sx={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                backgroundColor: '#FF6B6B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Typography sx={{ fontSize: '12px', color: 'white' }}>✕</Typography>
              </Box>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {promotion.votes.nay.percentage}% ({promotion.votes.nay.count}{promotion.votes.nay.label})
              </Typography>
            </Box>
            <Typography variant="subtitle2">
              Nay
            </Typography>
          </Box>

          {/* Pass */}
          <Box
            sx={{
              flex: 1,
              border: '1px solid #FFA726',
              borderRadius: '4px',
              p: 2,
              textAlign: 'center',
              backgroundColor: 'rgba(255, 167, 38, 0.1)'
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
              <Box sx={{
                width: 16,
                height: 16,
                borderRadius: '50%',
                backgroundColor: '#FFA726',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Typography sx={{ fontSize: '12px', color: 'white' }}>–</Typography>
              </Box>
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {promotion.votes.pass.percentage}% ({promotion.votes.pass.count}{promotion.votes.pass.label})
              </Typography>
            </Box>
            <Typography variant="subtitle2">
              Pass
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Voters Section */}
      <Box>
        <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
          Voters
        </Typography>

        <TableContainer component={Paper}>
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
                    active={orderBy === 'vote'}
                    direction={orderBy === 'vote' ? order : 'asc'}
                    onClick={() => handleRequestSort('vote')}
                  >
                    Vote
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
              {sortedVoters.map((voter, index) => (
                <TableRow key={index}>
                  <TableCell className="baker-cell">
                    {voter.baker}
                  </TableCell>
                  <TableCell className="voting-power-cell">
                    {voter.votingPower}
                  </TableCell>
                  <TableCell sx={{ color: '#38FF9C' }}>
                    {voter.vote}
                  </TableCell>
                  <TableCell className="time-cell">
                    {voter.time}
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

export default PromotionView;