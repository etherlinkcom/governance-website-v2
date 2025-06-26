import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Box, Typography, Button, Container, Stack, CircularProgress, Card, CardContent } from '@mui/material';
import { contractStore } from '@/stores/ContractStore';



/**
 *
 * TODO
 *
 * Add Time periods to choose from
 * Add proposal and promotion pages
 * Add tables to view voters
 */
const GovernancePage = observer(() => {
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

  const { contractData } = contractStore;

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          py: { xs: 4, sm: 6 },
          display: "flex",
          flexDirection: "column",
          gap: 4,
          alignItems: { xs: "center", sm: "flex-start" },
          maxWidth: "800px",
          mx: "auto",
        }}
      >
        <Typography variant="h1" component="h1">
          {contractData.title}
        </Typography>

        <Typography variant="body1">
          {contractData.description}
        </Typography>

        <Card sx={{ width: '100%' }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Contract Information
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Address
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {contractData.address}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 4 }}>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Voting Period
                </Typography>
                <Typography variant="body2">
                  {contractData.votingPeriod} days
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  Quorum Threshold
                </Typography>
                <Typography variant="body2">
                  {(contractData.quorumThreshold * 100).toFixed(0)}%
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems="center"
        >
          <Button variant="contained">
            Create Proposal
          </Button>
          <Button variant="outlined">
            View Proposals
          </Button>
          <Button
            variant="outlined"
            href="https://docs.etherlink.com/governance"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </Button>
        </Stack>
      </Box>
    </Container>
  );
});

export default GovernancePage;