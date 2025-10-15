import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { Box, Button, Container, Typography } from '@mui/material';
import { contractStore } from '@/stores/ContractStore';
import { GovernanceType } from '@trilitech/types';
import { Current } from '@/components/current/Current';
import { Past } from '@/components/past/Past';
import { Future } from '@/components/future/Future';

type ViewType = 'Current' | 'Past' | 'Upcoming';

export default observer(() => {
  const router = useRouter();
  const { governance } = router.query;
  const [selectedView, setSelectedView] = useState<ViewType | null>(null);

  const views: ViewType[] = ['Current', 'Past', 'Upcoming'];

  useEffect(() => {
    if (governance && typeof governance === 'string') {
      contractStore.setGovernance(governance as GovernanceType);
    }
  }, [governance]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const storedView = localStorage.getItem('governance-selected-view') as ViewType;
    if (storedView && views.includes(storedView)) {
      setSelectedView(storedView);
    } else {
      setSelectedView('Current');
    }
  }, []);

  const handleViewChange = (view: ViewType) => {
    setSelectedView(view);
    localStorage.setItem('governance-selected-view', view);
  };


  if (!selectedView) return null;

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          py: { xs: 1, sm: 2 },
          display: "flex",
          flexDirection: "column",
          gap: 2,
          alignItems: "flex-start",
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
              onClick={() => handleViewChange(view)}
            >
              {view}
            </Button>
          ))}
        </Box>

        <Box sx={{ width: '100%'}}>
          {selectedView === 'Current' && (
            <Current  />
          )}

          {selectedView === 'Past' && (
            <Past />
          )}

          {selectedView === 'Upcoming' && (
            <Future />
          )}
        </Box>
      </Box>
    </Container>
  );
});