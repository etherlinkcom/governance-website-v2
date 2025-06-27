import { useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import { observer } from 'mobx-react-lite';
import ProposalsView from './ProposalsView';
import PromotionView from './PromotionView';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const GovernanceDisplay = observer(() => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          sx={{
            '& .MuiTabs-indicator': {
              backgroundColor: 'primary.main',
            },
          }}
        >
          <Tab
            label="Proposals"
            sx={{
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: activeTab === 0 ? 600 : 400,
            }}
          />
          <Tab
            label="Promotion"
            sx={{
              textTransform: 'none',
              fontSize: '1rem',
              fontWeight: activeTab === 1 ? 600 : 400,
            }}
          />
        </Tabs>
      </Box>

      <TabPanel value={activeTab} index={0}>
        <ProposalsView />
      </TabPanel>
      <TabPanel value={activeTab} index={1}>
        <PromotionView />
      </TabPanel>
    </Box>
  );
});

export default GovernanceDisplay;