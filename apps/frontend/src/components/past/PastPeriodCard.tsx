import { Card, Box, Modal, Backdrop, Fade, Slide, useMediaQuery, useTheme, Theme } from '@mui/material';
import { useState } from 'react';
import { contractStore, LoadingState } from '@/stores/ContractStore';
import { observer } from 'mobx-react-lite';
import { PeriodVotingStatsPanel } from '@/components/promotion/PeriodVotingStatsPanel';
import { PeriodMetadata } from '@/components/past/PeriodMetadata';
import { FrontendPeriod } from '@/types/api';
import { PromotionView } from '@/components/promotion/PromotionView';
import { ProposalView } from '@/components/proposal/ProposalView';
import { ContractAndConfig } from '@trilitech/types';

interface PastPeriodCardProps {
  period: FrontendPeriod;
}

export const PastPeriodCard = observer(({ period }: PastPeriodCardProps) => {
  const theme: Theme = useTheme();
  const isMobile: boolean = useMediaQuery(theme.breakpoints.down('md'));
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  const hasProposals: boolean | undefined = period.proposals && period.proposals.length > 0;
  const hasPromotion: string | undefined = period.promotion?.proposal_hash;

  const loadingState: LoadingState = contractStore.statePastPeriods;
  const contractAndConfig: ContractAndConfig = contractStore.currentContract!;

  const handleCardClick = () => {
    if (hasProposals || hasPromotion) {
      setModalOpen(true);
    }
  };

  const modalContent = (
    <Box className="modal-content">
      {hasPromotion ? (
        <PromotionView period={period} onClose={() => setModalOpen(false)} />
      ) : hasProposals ? (
        <ProposalView period={period} onClose={() => setModalOpen(false)} />
      ) : null}
    </Box>
  );

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
          isLoading={loadingState === 'loading' || !loadingState}
          period={period}
        />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <PeriodMetadata
            period={period}
            proposals={period.proposals}
            hasProposals={hasProposals}
            hasPromotion={hasPromotion}
            isLoading={loadingState === 'loading' || !loadingState}
          />
        </Box>
      </Card>

      {/* Modal with responsive transitions */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 300,
          },
        }}
        disableAutoFocus
      >
        {isMobile ? (
          <Slide direction="up" in={modalOpen} timeout={300}>
            {modalContent}
          </Slide>
        ) : (
          <Fade in={modalOpen} timeout={300}>
            {modalContent}
          </Fade>
        )}
      </Modal>
    </>
  );
});