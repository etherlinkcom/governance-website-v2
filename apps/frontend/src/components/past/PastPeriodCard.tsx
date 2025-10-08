import { Card, Box, Modal } from '@mui/material';
import { useState } from 'react';
import { contractStore } from '@/stores/ContractStore';
import { observer } from 'mobx-react-lite';
import { PeriodVotingStatsPanel } from '@/components/promotion/PeriodVotingStatsPanel';
import { PeriodMetadata } from '@/components/past/PeriodMetadata';
import { FrontendPeriod } from '@/types/api';
import { PromotionView } from '@/components/promotion/PromotionView';
import { ProposalView } from '@/components/proposal/ProposalView';

interface PastPeriodCardProps {
  period: FrontendPeriod;
}

export const PastPeriodCard = observer(({ period }: PastPeriodCardProps) => {
  const [modalOpen, setModalOpen] = useState(false);

  // TODO change both of these to booleans
  const hasProposals: boolean | undefined = period.proposals && period.proposals.length > 0;
  const hasPromotion: string | undefined = period.promotion?.proposal_hash;

  const isLoading = contractStore.isLoadingPastPeriods;
  const contractAndConfig = contractStore.currentContract!;

  const handleCardClick = () => {
    if (hasProposals || hasPromotion) {
      setModalOpen(true);
    }
  };

  return (
    <>
      <Card
        className='past-card'
        onClick={handleCardClick}
        sx={{
          transition: 'all 0.3s ease-in-out',
          cursor: hasProposals || hasPromotion ? 'pointer' : 'default',
          position: 'relative',
          p: 2.5,
          display: 'flex',

          flexDirection: 'column-reverse',

        }}
      >
          <PeriodVotingStatsPanel
            hasPromotion={hasPromotion}
            hasProposals={hasProposals}
            promotions={period.promotion ? [period.promotion] : []}
            proposals={period.proposals}
            contractAndConfig={contractAndConfig}
            isLoading={isLoading}
            period={period}
          />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <PeriodMetadata
              period={period}
              proposals={period.proposals}
              hasProposals={hasProposals}
              hasPromotion={hasPromotion}
              isLoading={isLoading}
            />
          </Box>
      </Card>

      {/* Modals */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} disableAutoFocus>
        <Box className="modal-content">
          {hasPromotion ? (
            <PromotionView period={period} onClose={() => setModalOpen(false)} />
          ) : hasProposals ? (
            <ProposalView period={period} onClose={() => setModalOpen(false)} />
          ) : null}
        </Box>
      </Modal>
    </>
  );
});