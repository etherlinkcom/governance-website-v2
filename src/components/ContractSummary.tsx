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
    <Accordion
      defaultExpanded
      sx={{
        width: '100%',
        boxShadow: `0px 0px 6px 0px ${theme.palette.custom.shadow.primary}`,
        borderRadius: '10px',
        border: 'none',
        '&:before': {
          display: 'none',
        },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMoreIcon sx={{ color: theme.palette.primary.main }} />}
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

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 3 }}>
              <Box>
                <Typography variant="subtitle1">
                  Contract type
                </Typography>
                <Typography variant="body2">
                  {contractInfo?.type}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle1">
                  Contract address
                </Typography>
                <Typography variant="body2">
                  {contractInfo?.address}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle1">
                  Started at level
                </Typography>
                <Typography variant="body1">
                  {contractInfo?.startedAtLevel}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle1">
                  Period length
                </Typography>
                <Typography variant="body1">
                  {contractInfo?.periodLength}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle1">
                  Adoption period
                </Typography>
                <Typography variant="body1">
                  {contractInfo?.adoptionPeriod}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle1">
                  Upvoting limit
                </Typography>
                <Typography variant="body1">
                  {contractInfo?.upvotingLimit}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle1">
                  Proposal quorum
                </Typography>
                <Typography variant="body1">
                  {contractInfo?.proposalQuorum}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle1">
                  Promotion quorum
                </Typography>
                <Typography variant="body1">
                  {contractInfo?.promotionQuorum}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle1">
                  Promotion supermajority
                </Typography>
                <Typography variant="body1">
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
        </Box>
      </AccordionDetails>
    </Accordion>
  );
});

export default ContractSummary;