import { useState, useEffect, JSX } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import { observer } from 'mobx-react-lite';
import {ProposalsView } from './ProposalsView';
import {PromotionView} from './PromotionView';

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

const tabConfig: { label: string; component: JSX.Element }[] = [
  { label: 'Proposals', component: <ProposalsView /> },
  { label: 'Promotion', component: <PromotionView /> },
];

const TAB_STORAGE_KEY = 'governance-active-tab';

function clampTabIndex(index: number) {
  if (Number.isNaN(index) || index < 0) return 0;
  if (index >= tabConfig.length) return tabConfig.length - 1;
  return index;
}

export const GovernanceDisplay = observer(() => {
  const [activeTab, setActiveTab] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(TAB_STORAGE_KEY);
      if (stored !== null) {
        setActiveTab(clampTabIndex(Number(stored)));
      } else {
        setActiveTab(0);
      }
    }
  }, []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    localStorage.setItem(TAB_STORAGE_KEY, String(newValue));
  };

  if (activeTab === null) return null;

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

      {tabConfig.map((tab, idx) => (
        <TabPanel key={tab.label} value={activeTab} index={idx}>
          {tab.component}
        </TabPanel>
      ))}
    </Box>
  );
});