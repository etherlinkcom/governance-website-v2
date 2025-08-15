import { Card, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Period } from '@trilitech/types';
import { useState } from 'react';
import { PeriodDetailsModal } from '@/components/period/PeriodDetailsModal';
import { formatDate } from '@/lib/formatDate';
import { HashDisplay } from '@/components/shared/HashDisplay';
import { HashLink } from '@/components/shared/HashLink';
import { PayloadKey } from '@/data/proposalLinks';
import { getLinkData } from '@/lib/getLinkData';
import { contractStore } from '@/stores/ContractStore';
import { observer } from 'mobx-react-lite';
import { PeriodVotingStatsPanel } from '@/components/period/PeriodVotingStatsPanel';
import { PeriodMetadata } from '@/components/period/PeriodMetadata';
import { FrontendPeriod } from '@/types/api';
import { PromotionModal } from './PromotionModal';

interface PastPeriodCardProps {
  period: FrontendPeriod;
}

export const PastPeriodCard = observer(({ period }: PastPeriodCardProps) => {
  const theme = useTheme();
  const [modalOpen, setModalOpen] = useState(false);

  const hasProposals = period.proposals && period.proposals.length > 0;
  const hasPromotion = period.promotion?.proposal_hash;

  const isLoading = contractStore.isLoadingPastPeriods;
  const contractAndConfig = contractStore.currentContract!;

  const handleCardClick = () => {
    if (hasProposals || hasPromotion) {
      setModalOpen(true);
    }
  };

  const renderHash = (hash: PayloadKey) => {
    const linkData = getLinkData(hash);
    if (linkData) return <HashLink hash={hash} />;
    return <HashDisplay hash={hash} />;
  }

  return (
    <>
      <Card
        className='past-card'
        onClick={handleCardClick}
        sx={{
          transition: 'all 0.3s ease-in-out',
          cursor: hasProposals || hasPromotion ? 'pointer' : 'default',
          position: 'relative',
          p: 2.5
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
              renderHash={renderHash}
            />
          </Box>
      </Card>
      {/* if proposal open proposal modal, if promotion open promotion modal */}
      <PromotionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        period={period}
      />
    </>
  );
});