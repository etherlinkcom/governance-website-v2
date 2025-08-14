import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Box, Button, Container, Typography } from '@mui/material';
import { contractStore } from '@/stores/ContractStore';
import { GovernanceType } from '@trilitech/types';

export default observer(() => {
  const router = useRouter();
  const { contract } = router.query;

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
          {contractStore.selectedGovernance} Governance
        </Typography>
        <Box>
          <Button
            variant="contained"
            onClick={() => {
              // Handle button click
            }}
          >
            Current
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              // Handle button click
            }}
          >
            Past
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              // Handle button click
            }}
          >
            Future
          </Button>
        </Box>
      </Box>
    </Container>
  );
});