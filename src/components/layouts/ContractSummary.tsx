import { Box, Typography, Button, Stack, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { observer } from 'mobx-react-lite';
import { contractStore } from '@/stores/ContractStore';
import { useTheme } from '@mui/material/styles';

const ContractSummary = observer(() => {
  const { contractData, contractInfo } = contractStore;
  const theme = useTheme();

  if (!contractData) return null;

  return (
    <Accordion >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h1" component="h1">
          {contractData.title}
        </Typography>
      </AccordionSummary>

      <AccordionDetails>
        <Typography variant="body1">
          {contractData.description}
        </Typography>

        {/* Contract Information */}
        <Box sx={{ width: '100%' }}>
          <Typography variant="h6" sx={{ mb: theme.spacing(2) }}>
            Contract Information
          </Typography>

          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: theme.spacing(2),
            mb: theme.spacing(3)
          }}>
            <Box>
              <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                Contract type
              </Typography>
              <Typography variant="body2" sx={{ color: theme.palette.primary.main }}>
                {contractInfo?.type}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                Contract address
              </Typography>
              <Typography variant="body2" sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {contractInfo?.address}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                Started at level
              </Typography>
              <Typography variant="body2">
                {contractInfo?.startedAtLevel}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                Period length
              </Typography>
              <Typography variant="body2">
                {contractInfo?.periodLength}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                Adoption period
              </Typography>
              <Typography variant="body2">
                {contractInfo?.adoptionPeriod}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                Upvoting limit
              </Typography>
              <Typography variant="body2">
                {contractInfo?.upvotingLimit}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                Proposal quorum
              </Typography>
              <Typography variant="body2">
                {contractInfo?.proposalQuorum}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                Promotion quorum
              </Typography>
              <Typography variant="body2">
                {contractInfo?.promotionQuorum}
              </Typography>
            </Box>

            <Box>
              <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                Promotion supermajority
              </Typography>
              <Typography variant="body2">
                {contractInfo?.promotionSupermajority}
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
      </AccordionDetails>
    </Accordion>
  );
});

export default ContractSummary;