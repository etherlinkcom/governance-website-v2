import { Accordion, AccordionSummary, AccordionDetails, Box, Typography, Chip, IconButton } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ContractAndConfig } from '@trilitech/types';
import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { ContractInfoModal } from '@/components/contract/ContractInfoModal';
import { InfoIcon } from '@/components/shared/InfoIcon';
import { contractStore } from '@/stores/ContractStore';
import { PeriodsList } from '@/components/period/PeriodList';

interface ContractCardProps {
  contract: ContractAndConfig;
  expanded: boolean;
  onChange: (contractAddress: string) => void;
}

export const ContractCard = observer(({ contract, expanded, onChange }: ContractCardProps) => {
  const [modalOpen, setModalOpen] = useState(false);

  const handleChange = () => {
    onChange(contract.contract_address);
  };

  const handleInfoClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  useEffect(() => {
    if (expanded && !contractStore.hasPeriodsLoaded(contract.contract_address)) {
      contractStore.getPeriods(contract.contract_address);
    }
  }, [expanded, contract.contract_address]);

  const periods = contractStore.getPeriodsForContract(contract.contract_address);
  const isLoadingPeriods = contractStore.isLoadingPeriods(contract.contract_address);

  return (
    <>
      <Accordion expanded={expanded} onChange={handleChange}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', pr: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Typography
                variant="body1"
                sx={{
                  fontFamily: 'monospace',
                  fontWeight: 'medium',
                  mb: 0.5
                }}
              >
                {contract.contract_address}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Level: {contract.started_at_level.toLocaleString()}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {Boolean(contract.active) && (
                <Chip
                  label={'Active'}
                  size="small"
                  color={'success'}
                />
              )}

              <IconButton
                size="small"
                onClick={handleInfoClick}
                sx={{ ml: 1, color: 'primary.main' }}
              >
                <InfoIcon />
              </IconButton>
            </Box>
          </Box>
        </AccordionSummary>

        <AccordionDetails>
          <Box sx={{ width: '100%' }}>
            <PeriodsList
              periods={periods}
              isLoading={isLoadingPeriods}
            />
          </Box>
        </AccordionDetails>
      </Accordion>

      <ContractInfoModal
        open={modalOpen}
        onClose={handleModalClose}
        contract={contract}
      />
    </>
  );
});