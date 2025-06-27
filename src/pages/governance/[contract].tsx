import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Box, Container, CircularProgress } from '@mui/material';
import { contractStore } from '@/stores/ContractStore';
import ContractSummary from '@/components/ContractSummary';
import GovernanceDisplay from '@/components/GovernanceDisplay';



/**
 *
 * TODO
 *
 * Add Time periods to choose from
 * Add proposal and promotion pages
 * Add tables to view voters
 */
const Contract = observer(() => {
  const router = useRouter();
  const { contract } = router.query;

  useEffect(() => {
    if (contract && typeof contract === 'string') {
      const governanceType = contract as 'slow' | 'fast' | 'sequencer';
      contractStore.setContract(governanceType);
    }
  }, [contract]);

  if (!contractStore.contractData) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
          <CircularProgress />
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
        <ContractSummary />
        <GovernanceDisplay />
      </Box>
    </Container>
  );
});

export default Contract;