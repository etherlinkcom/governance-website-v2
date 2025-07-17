import { Box, Typography, Button, Stack, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { observer } from 'mobx-react-lite';
import { contractStore2 } from '@/stores/ContractStore2';
import { useTheme} from '@mui/material/styles';
import {ComponentLoading} from '@/components/shared/ComponentLoading';
import { useState, useEffect } from 'react';
import { prettifyKey } from '@/lib/prettifyKey';

const ACCORDION_KEY = 'contract-accordion-expanded';

const ContractSummarySkeleton = () => {
  const theme = useTheme();
  const [expanded, setExpanded] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(ACCORDION_KEY) === 'true';
    }
    return false;
  });

  const handleChange = (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded);
    localStorage.setItem(ACCORDION_KEY, String(isExpanded));
  };

  return (
    <Accordion expanded={expanded} onChange={handleChange}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <ComponentLoading width={300} height={32} borderRadius={2} />
      </AccordionSummary>
      <AccordionDetails>
        <Box sx={{ p: theme.spacing(3) }}>
          <Box sx={{ mb: 4 }}>
            <ComponentLoading width="100%" height={20} borderRadius={1} />
            <Box sx={{ mt: 1 }}>
              <ComponentLoading width="75%" height={20} borderRadius={1} />
            </Box>
          </Box>
          <Box sx={{ mb: 3 }}>
            <ComponentLoading width={180} height={24} borderRadius={1} />
          </Box>
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: theme.spacing(2),
            mb: theme.spacing(4)
          }}>
            {[...Array(9)].map((_, index) => (
              <Box key={index}>
                <ComponentLoading width={80} height={14} borderRadius={0.5} />
                <Box sx={{ mt: 0.5 }}>
                  <ComponentLoading width={100} height={18} borderRadius={1} />
                </Box>
              </Box>
            ))}
          </Box>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <ComponentLoading width={140} height={48} borderRadius={6} />
            <ComponentLoading width={140} height={48} borderRadius={6} />
          </Stack>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export const ContractSummary = observer(() => {
  const { contractData, contractInfo, isLoading } = contractStore2;
  const theme = useTheme();
  const [expanded, setExpanded] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(ACCORDION_KEY) === 'true';
    }
    return false;
  });

  const handleChange = (_event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpanded(isExpanded);
    localStorage.setItem(ACCORDION_KEY, String(isExpanded));
  };

  useEffect(() => {
    const sync = () => {
      setExpanded(localStorage.getItem(ACCORDION_KEY) === 'true');
    };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  if (isLoading) return <ContractSummarySkeleton />;
  if (!contractData) return null;

  return (
    <Accordion expanded={expanded} onChange={handleChange}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Typography variant="h1" component="h1" sx={{ textTransform: 'capitalize' }}>
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

          {contractInfo && Object.entries(contractInfo).map(([key, value]) => (
            <Box key={key} sx={{overflow: 'hidden'}}>
              <Typography variant="caption" sx={{ display: 'block', mb: 0.5, textTransform: 'capitalize' }}>
                {prettifyKey(key)}
              </Typography>
              <Typography variant="body2" sx={{textTransform: 'capitalize'}}>
                {value}
              </Typography>
            </Box>
          ))}
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