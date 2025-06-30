import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Box, Container} from '@mui/material';
import { contractStore } from '@/stores/ContractStore';
import ContractSummary from '@/components/layouts/ContractSummary';
import GovernanceDisplay from '@/components/layouts/GovernanceDisplay';

const Contract = observer(() => {
  const router = useRouter();
  const { contract } = router.query;

  useEffect(() => {
    if (contract && typeof contract === 'string') {
      const governanceType = contract as 'slow' | 'fast' | 'sequencer';
      contractStore.setContract(governanceType);
    }
  }, [contract]);

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