import { Accordion, AccordionSummary, AccordionDetails, Box, Typography, Chip, IconButton, Link } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { ContractAndConfig } from '@trilitech/types';
import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { ContractInfoModal } from '@/components/contract/ContractInfoModal';
import { InfoIcon } from '@/components/shared/InfoIcon';
import { contractStore } from '@/stores/ContractStore';
import { PeriodsList } from '@/components/period/PeriodList';
import { CopyButton } from '@/components/shared/CopyButton';
import { EllipsisBox } from '@/components/shared/EllipsisBox';

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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <EllipsisBox sx={{maxWidth: {xs: '45vw', md: '100%'} }}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
              }}>
                <Link
                  variant="body2"
                  href={`${process.env.NEXT_PUBLIC_TZKT_URL}/${contract.contract_address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(event) => event.stopPropagation()}
                  className="contract-link"
                >
                  Contract: {contract.contract_address}
                </Link>
                <CopyButton
                  text={contract.contract_address}
                  message="Contract address copied!"
                  size="small"
                  sx={{ mt: 0.5, color: 'primary.main'}}
                />
              </Box>
            </EllipsisBox>

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
                sx={{ color: 'primary.main' }}
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