import { Accordion, AccordionSummary, AccordionDetails, Box, Typography, Chip, IconButton, Link } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ContractAndConfig } from '@trilitech/types';
import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { ContractInfoModal } from '@/components/contract/ContractInfoModal';
import { InfoIcon } from '@/components/shared/icons/InfoIcon';
import { contractStore } from '@/stores/ContractStore';
import { PeriodsList } from '@/components/period/PeriodList';
import { CopyButton } from '../shared/CopyButton';

interface ContractCardProps {
  contract: ContractAndConfig;
  expanded: boolean;
  onChange: (contractAddress: string) => void;
}

export const ContractCard = observer(({ contract, expanded, onChange }: ContractCardProps) => {
  const [modalOpen, setModalOpen] = useState(false);

  const handleInfoClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    setModalOpen(true);
  };

  const handleChange = () => onChange(contract.contract_address);
  const handleModalClose = () => setModalOpen(false);

  useEffect(() => {
    if (expanded && !contractStore.hasPeriodsLoaded(contract.contract_address)) {
      contractStore.getPeriods(contract.contract_address);
    }
  }, [expanded, contract.contract_address]);

  const periods = contractStore.periodsForContract(contract.contract_address);
  const isLoadingPeriods = contractStore.isLoadingPeriods(contract.contract_address);

  return (
    <>
      <Accordion expanded={expanded} onChange={handleChange}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', pr: 2 }}>
            <Box sx={{ flex: 1 }}>
              <Link
                variant="body2"
                href={`${process.env.NEXT_PUBLIC_TZKT_API_URL}/${contract.contract_address}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(event) => event.stopPropagation()}
              >
                Contract: {contract.contract_address}
              </Link>
              <CopyButton
                text={contract.contract_address}
                message="Contract address copied!"
                size="small"
                sx={{ ml: 0.5, mt: -0.5, color: 'primary.main' }}
              />

              <Typography variant="body1" color="text.secondary" sx={{mt: 1}}>
                Level: {contract.started_at_level.toLocaleString()}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {Boolean(contract.active) && (
                <Chip
                  variant='outlined'
                  label={'Active'}
                  size="small"
                  color={'success'}
                />
              )}

              <IconButton
                component='span'
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