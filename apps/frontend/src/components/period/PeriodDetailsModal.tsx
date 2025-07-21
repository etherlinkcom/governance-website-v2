import { useState, useEffect } from 'react';
import { Box, Tabs, Tab, Modal, Typography, IconButton, Link } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { observer } from 'mobx-react-lite';
import { ProposalsView } from '@/components/proposal/ProposalsView';
import { PromotionView } from '@/components/promotion/PromotionView';
import { usePeriodData } from '@/hooks/usePeriodData';
import { Period } from '@trilitech/types';
import { formatDate } from '@/lib/formatDate';

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
  period: Period;
}

export const PeriodDetailsModal = observer(({ open, onClose, period }: PeriodDetailsModalProps) => {
  const [activeTab, setActiveTab] = useState(0);

  const hasProposals = period.proposal_hashes && period.proposal_hashes.length > 0;
  const hasPromotions = !!period.promotion_hash;

  const {
    proposals,
    promotions,
    error,
    proposalsPeriod,
    promotionsPeriod,
    proposalsPeriodData,
    promotionsPeriodData
  } = usePeriodData(
    period.contract_address,
    period.contract_voting_index,
    hasProposals,
    hasPromotions
  );

  const tabConfig: { label: string; component: React.ReactNode; isPrimaryPeriod: boolean }[] = [];

  if (proposals.length > 0) {
    const isPrimaryPeriod = proposalsPeriod === period.contract_voting_index;
    tabConfig.push({
      label: `Proposals - Period ${proposalsPeriod}`,
      component: (
        <ProposalsView
          contractVotingIndex={proposalsPeriod}
          contractAddress={period.contract_address}
        />
      ),
      isPrimaryPeriod
    });
  }

  if (promotions.length > 0) {
    const isPrimaryPeriod = promotionsPeriod === period.contract_voting_index;
    tabConfig.push({
      label: `Promotion - Period ${promotionsPeriod}`,
      component: (
        <PromotionView
          contractVotingIndex={promotionsPeriod}
          contractAddress={period.contract_address}
          promotionHash={period.promotion_hash}
        />
      ),
      isPrimaryPeriod
    });
  }

  if (error && tabConfig.length === 0) {
    tabConfig.push({
      label: 'Error',
      component: (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography color="error">Error: {error}</Typography>
        </Box>
      ),
      isPrimaryPeriod: true
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
            <Link
                variant="contract-link"
                href={`${process.env.NEXT_PUBLIC_TZKT_API_URL}/${period.contract_address}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Contract: {period.contract_address}
              </Link>
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
            <Box sx={{ flex: 1, textAlign: 'left' }}>
              {proposals.length > 0 && proposalsPeriodData && (
                <>
                  <Typography variant="h6" color="success.main">
                    Proposals - Period {proposalsPeriod}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
                    Dates: {formatDate(proposalsPeriodData.date_start)} - {formatDate(proposalsPeriodData.date_end)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Levels: {proposalsPeriodData.level_start.toLocaleString()} - {proposalsPeriodData.level_end.toLocaleString()}
                  </Typography>
                </>
               )}

            </Box>

            {/* Promotions Period - Right */}
            <Box sx={{ flex: 1 }}>
              {promotions.length > 0 && promotionsPeriodData && (
                <>
                  <Typography variant="h6" color="warning.main">
                    Promotion - Period {promotionsPeriod}
                  </Typography>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 1 }}>
                    Dates: {formatDate(promotionsPeriodData.date_start)} - {formatDate(promotionsPeriodData.date_end)}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Levels: {promotionsPeriodData.level_start.toLocaleString()} - {promotionsPeriodData.level_end.toLocaleString()}
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
            {tabConfig.map((tab, idx) => (
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
    </Modal>
  );
});