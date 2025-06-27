import { Box, Typography, Button, Stack, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { observer } from 'mobx-react-lite';
import { contractStore } from '@/stores/ContractStore';

const ContractSummary = observer(() => {
  const { contractData } = contractStore;

  if (!contractData) return null;

  return (
    <Accordion
      defaultExpanded
      sx={{
        width: '100%',
        boxShadow: '0px 0px 6px 0px #38FF9C66',
        borderRadius: '10px',
        border: 'none',
        '&:before': {
          display: 'none',
        },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ color: 'primary.main' }} />}
        sx={{
          borderRadius: '10px 10px 0 0',
          '& .MuiAccordionSummary-content': {
            margin: '12px 0',
          },
        }}
      >
        <Typography variant="h1" component="h1">
          {contractData.title}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <Typography variant="body1">
            {contractData.description}
          </Typography>

          {/* Contract Information */}
          <Box sx={{ width: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Contract Information
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2">
                Address
              </Typography>
              <Typography variant="body2">
                {contractData.address}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 4 }}>
              <Box>
                <Typography variant="subtitle2">
                  Voting Period
                </Typography>
                <Typography variant="body2">
                  {contractData.votingPeriod} days
                </Typography>
              </Box>
              <Box>
                <Typography variant="subtitle2">
                  Quorum Threshold
                </Typography>
                <Typography variant="body2">
                  {(contractData.quorumThreshold * 100).toFixed(0)}%
                </Typography>
              </Box>
            </Box>
          </Box>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems="center"
          >
            <Button variant="contained">
              Create Proposal
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
      </AccordionDetails>
    </Accordion>
  );
});

export default ContractSummary;