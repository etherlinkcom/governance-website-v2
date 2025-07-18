import { useState, useEffect } from 'react';
import { Box, Tabs, Tab, Modal, Typography, IconButton } from '@mui/material';
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
    isLoading,
    error,
    proposalsPeriod,
    promotionsPeriod
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

  if (isLoading && tabConfig.length === 0) {
    tabConfig.push({
      label: 'Loading...',
      component: (
        <Box sx={{ p: 3, textAlign: 'center' }}>
          <Typography>Loading period details...</Typography>
        </Box>
      ),
      isPrimaryPeriod: true
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
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '95%',
        maxWidth: '90vw',
        height: '90vh',
        bgcolor: 'background.paper',
        borderRadius: 1,
        boxShadow: 24,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Modal Header - Fixed */}
        <Box sx={{
          p: 3,
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0
        }}>
          <Box>
            <Typography variant="h5">
              Period {period.contract_voting_index} Details
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Contract: {period.contract_address}
            </Typography>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mt: 0.5 }}>
              Dates: {formatDate(period.date_start)} - {formatDate(period.date_end)}
            </Typography>

            <Typography variant="caption" color="text.secondary">
              Levels: {period.level_start.toLocaleString()} - {period.level_end.toLocaleString()}
            </Typography>
          </Box>
          <IconButton onClick={onClose} sx={{ ml: 2 }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Tabs - Fixed */}
        <Box sx={{
          borderBottom: 1,
          borderColor: 'divider',
          flexShrink: 0
        }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            sx={{
              '& .MuiTabs-indicator': {
                backgroundColor: 'primary.main',
              },
            }}
          >
            {tabConfig.map((tab, idx) => (
              <Tab
                key={tab.label}
                label={tab.label}
                sx={{
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: activeTab === idx ? 600 : 400,
                }}
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