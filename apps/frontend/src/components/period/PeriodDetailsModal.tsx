import { useState, useEffect } from 'react';
import { Box, Tabs, Tab, Modal, Typography, IconButton, Link } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { observer } from 'mobx-react-lite';
import { ProposalsView } from '@/components/proposal/ProposalsView';
import { PromotionView } from '@/components/promotion/PromotionView';
import { Period } from '@trilitech/types';
import { formatDate } from '@/lib/formatDate';
import { contractStore } from '@/stores/ContractStore';
import { CopyButton } from '@/components/shared/CopyButton';
import { EllipsisBox } from '@/components/shared/EllipsisBox';
import { ComponentLoading } from '@/components/shared/ComponentLoading';
import { SortableTableSkeleton } from '@/components/shared/SortableTable';
import { VotingResultsSkeleton } from '@/components/promotion/VotingResults';
import { FrontendPeriod } from '@/types/api';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div hidden={value !== index}>
      {value === index && (
        <Box sx={{
          py: 3,
          width: '100%',
          px: { xs: 0, sm: 2 }
        }}>
          {children}
        </Box>
      )}
    </div>
  );
}

interface PeriodDetailsModalProps {
  open: boolean;
  onClose: () => void;
  period: FrontendPeriod;
}


const PeriodDetailsSkeleton = ({ tabValue, onClose }: { tabValue: number; onClose: () => void }) => {
  const blankColumns = Array.from({ length: 4 }, (_, i) => ({ id: `${i}`, label: '' }));
  return (
    <Box className="modal-content">
      <Box sx={{
        p: 3,
        borderBottom: '1px solid',
        borderColor: 'divider',
        flexShrink: 0
      }}>
        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
          gap: 2,
        }}>
          <ComponentLoading width={220} height={24} borderRadius={2} />
          <IconButton
            onClick={onClose}
            sx={{
              flexShrink: 0,
              minWidth: 48,
              width: 48,
              height: 48,
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        <Box sx={{ display: 'flex', gap: 4 }}>
          <Box sx={{ flex: 1 }}>
            <ComponentLoading width={180} height={28} borderRadius={2} />
            <ComponentLoading width={120} height={20} borderRadius={2} sx={{ mt: 1 }} />
            <ComponentLoading width={100} height={16} borderRadius={2} sx={{ mt: 1 }} />
          </Box>
          <Box sx={{ flex: 1, display: { xs: 'none', sm: 'block' } }}>
            <ComponentLoading width={180} height={28} borderRadius={2} />
            <ComponentLoading width={120} height={20} borderRadius={2} sx={{ mt: 1 }} />
            <ComponentLoading width={100} height={16} borderRadius={2} sx={{ mt: 1 }} />
          </Box>
        </Box>
      </Box>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}>
        <Tabs value={tabValue} >
          <Tab label={<ComponentLoading width={120} height={24} borderRadius={2} />} />
          <Tab label={<ComponentLoading width={120} height={24} borderRadius={2} />} />
        </Tabs>
      </Box>
      <Box sx={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
        <TabPanel value={0} index={0}>
          <Box sx={{ py: 3 }}>
            <ComponentLoading width="100%" height={80} borderRadius={2} sx={{ mb: 2 }} />
            {tabValue === 1 && <VotingResultsSkeleton />}
            <SortableTableSkeleton columns={blankColumns} />
          </Box>
        </TabPanel>
      </Box>
    </Box>
  );
}

export const PeriodDetailsModal = observer(({ open, onClose, period }: PeriodDetailsModalProps) => {
  const [activeTab, setActiveTab] = useState(0);

  const hasProposals = period.proposals && period.proposals.length > 0;
  const hasPromotions = !!period.promotion;
  const isLoading = contractStore.isLoadingPastPeriods;

  // const {
  //   proposals,
  //   promotions,
  //   error,
  //   isLoading,
  //   proposalsPeriod,
  //   promotionsPeriod,
  //   proposalsPeriodData,
  //   promotionsPeriodData
  // } = contractStore.getPeriodData(
  //   period.contract,
  //   period.contract_voting_index,
  //   hasProposals,
  //   hasPromotions
  // );

  const tabConfig: { label: string; component: React.ReactNode; isPrimaryPeriod: boolean }[] = [];

  if (period.proposals && period.proposals.length > 0) {
    const isPrimaryPeriod = !!period.proposals;
    tabConfig.push({
      label: `Proposals - Period ${period.contract_voting_index}`,
      component: (
        <ProposalsView
          contractVotingIndex={proposalsPeriod}
          contractAddress={period.contract_address}
          isCurrentPeriod={proposalsPeriodData?.period_class === 'current'}
        />
      ),
      isPrimaryPeriod
    });
  }

  if (period.promotion) {
    const isPrimaryPeriod = !!period.promotion;
    tabConfig.push({
      label: `Promotion - Period ${period.contract_voting_index}`,
      component: (
        <PromotionView
          contractVotingIndex={promotionsPeriod}
          contractAddress={period.contract_address}
          promotionHash={period.promotion_hash}
          isCurrentPeriod={promotionsPeriodData?.period_class === 'current'}
        />
      ),
      isPrimaryPeriod
    });
  }

  useEffect(() => {
    if (open && tabConfig.length > 0) {
      const primaryTabIndex = tabConfig.findIndex(tab => tab.isPrimaryPeriod);
      setActiveTab(primaryTabIndex >= 0 ? primaryTabIndex : 0);
    }
  }, [open, tabConfig.length]);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Modal open={open} onClose={onClose}>
      {isLoading ? (
        <PeriodDetailsSkeleton tabValue={activeTab} onClose={onClose} />
      ) : (
      <Box className="modal-content">
        <Box sx={{
          p: 3,
          borderBottom: '1px solid',
          borderColor: 'divider',
          flexShrink: 0
        }}>
          <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
            gap: 2,
          }}>
            <EllipsisBox sx={{display:'flex'}}>
            <Link
              className="contract-link"
              href={`${process.env.NEXT_PUBLIC_TZKT_URL}/${period.contract_address}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Contract: {period.contract}
            </Link>
            <CopyButton
              text={period.contract}
              message="Contract address copied!"
              size="small"
              sx={{ ml: 0.5, mt: -0.25, color: 'primary.main' }}
            />
          </EllipsisBox>
          <IconButton
            onClick={onClose}
            sx={{
                flexShrink: 0,
                minWidth: 48,
                width: 48,
                height: 48,
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ display: 'flex', gap: 4 }}>
            {/* Proposals Period - Left */}
            <Box sx={{
              flex: 1,
              textAlign: 'left',
              display: { xs: activeTab === 0 ? 'block' : 'none', sm: 'block' }
            }}>
              {period.proposals &&(
                <>
                  <Typography variant="h6" color="success.main">
                    Proposals - Period {period.contract_voting_index}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
                    Dates: {formatDate(period.startDateTime)} - {formatDate(period.endDateTime)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Levels: {period.startLevel.toLocaleString()} - {period.endLevel.toLocaleString()}
                  </Typography>
                </>
               )}
            </Box>

            {/* Promotions Period - Right */}
            <Box sx={{
              flex: 1,
              display: { xs: activeTab === 1 ? 'block' : 'none', sm: 'block' }
            }}>
              {period.promotion && (
                <>
                  <Typography variant="h6" color="warning.main">
                    Promotion - Period {period.contract_voting_index}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
                    Dates: {formatDate(period.startDateTime)} - {formatDate(period.endDateTime)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Levels: {period.startLevel.toLocaleString()} - {period.endLevel.toLocaleString()}
                  </Typography>
                </>
              )}
            </Box>
          </Box>
        </Box>

        {/* Tabs */}
        <Box sx={{
          borderBottom: 1,
          borderColor: 'divider',
          flexShrink: 0
        }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
          >
            {tabConfig.map((tab) => (
              <Tab
                key={tab.label}
                label={tab.label}
              />
            ))}
          </Tabs>
        </Box>

        {/* Content Area - Scrollable */}
        <Box sx={{
          flex: 1,
          overflow: 'auto',
          minHeight: 0
        }}>
          {tabConfig.map((tab, idx) => (
            <TabPanel key={tab.label} value={activeTab} index={idx}>
              {tab.component}
            </TabPanel>
          ))}
        </Box>
      </Box>
      )}
    </Modal>
  );
});