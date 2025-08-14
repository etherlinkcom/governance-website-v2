import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Box, Button, Container, Typography } from '@mui/material';
import { contractStore } from '@/stores/ContractStore';
import { GovernanceType } from '@trilitech/types';
import { Current } from '@/components/views/Current';

type ViewType = 'Current' | 'Past' | 'Future';

export default observer(() => {
  const router = useRouter();
  const { contract } = router.query;
  const [selectedView, setSelectedView] = useState<ViewType>('Current');

  const views: ViewType[] = ['Current', 'Past', 'Future'];

  useEffect(() => {
    if (contract && typeof contract === 'string') {
      const governanceType = contract as GovernanceType;
      contractStore.setGovernance(governanceType);
    }
  }, [contract]);

  if (contractStore.currentError) {
    return (
      <Container maxWidth="lg">
        <Box p={4}>
          <Typography color="error">
            Error: {contractStore.currentError}
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          py: { xs: 1, sm: 2 },
          display: "flex",
          flexDirection: "column",
          gap: 2,
          alignItems: { xs: "center", sm: "flex-start" },
          maxWidth: "1200px",
          mx: "auto",
        }}
      >
        <Typography variant="h4" textTransform={'capitalize'}>
          {contractStore.selectedGovernance} Governance
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {views.map((view) => (
            <Button
              sx={{borderRadius: '12px'}}
              key={view}
              variant={selectedView === view ? 'contained' : 'outlined'}
              onClick={() => setSelectedView(view)}
            >
              {view}
            </Button>
          ))}
        </Box>

        {/* Conditional content based on selected view */}
        <Box sx={{ width: '100%'}}>
          {selectedView === 'Current' && (
            <Box>
              {contractStore.currentPeriodData ? (
                <Current  />
              ) : (
                <Typography>No current period data</Typography>
              )}
            </Box>
          )}

          {selectedView === 'Past' && (
            <Box>
              <Typography variant="h5" gutterBottom>Past Periods</Typography>
              {contractStore.pastPeriodsData && contractStore.pastPeriodsData.length > 0 ? (
                <pre>{JSON.stringify(contractStore.pastPeriodsData, null, 2)}</pre>
              ) : (
                <Typography>No past periods data</Typography>
              )}
            </Box>
          )}

          {selectedView === 'Future' && (
            <Box>
              <Typography variant="h5" gutterBottom>Future Periods</Typography>
              {contractStore.futurePeriodsData && contractStore.futurePeriodsData.length > 0 ? (
                <pre>{JSON.stringify(contractStore.futurePeriodsData, null, 2)}</pre>
              ) : (
                <Typography>No future periods data</Typography>
              )}
            </Box>
          )}
        </Box>
      </Box>
    </Container>
  );
});