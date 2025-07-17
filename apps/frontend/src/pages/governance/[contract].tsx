import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Box, Container, Typography, CircularProgress } from '@mui/material';
import { contractStore } from '@/stores/ContractStore';
import { GovernanceType } from '@trilitech/types';
import { ContractsList } from '@/components/contract/ContractsList';

export default observer(() => {
  const router = useRouter();
  const { contract } = router.query;

  useEffect(() => {
    if (contract && typeof contract === 'string') {
      const governanceType = contract as GovernanceType;
      contractStore.setGovernance(governanceType);
    }
  }, [contract]);

  if (contractStore.loading) {
    return (
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="center" p={4}>
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>
            Loading {contractStore.currentGovernance} contracts...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (contractStore.error) {
    return (
      <Container maxWidth="lg">
        <Box p={4}>
          <Typography color="error">
            Error: {contractStore.error}
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          py: { xs: 4, sm: 6 },
          display: "flex",
          flexDirection: "column",
          gap: 4,
          alignItems: { xs: "center", sm: "flex-start" },
          maxWidth: "1200px",
          mx: "auto",
        }}
      >
        <Typography variant="h4" textTransform={'capitalize'}>
          {contractStore.currentGovernance} Governance
        </Typography>

        <ContractsList />
      </Box>
    </Container>
  );
});