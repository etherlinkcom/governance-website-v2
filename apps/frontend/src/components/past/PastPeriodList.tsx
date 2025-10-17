"use client";

import { Box, Card, Typography } from '@mui/material';
import { Fragment } from 'react';
import { observer } from 'mobx-react-lite';
import { ComponentLoading } from '@/components/shared/ComponentLoading';
import { FrontendPeriod } from '@/types/api';
import { formatDate } from '@/lib/formatDate';
import { PastPeriodCard } from '@/components/past/PastPeriodCard';

const PastPeriodCardSkeleton = () => {
  return (
    <Card sx={{ p: 2.3, display: 'flex', flexDirection: 'column'}}>
      <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap:1}}>
        <ComponentLoading height={16} borderRadius={1} sx={{mb: 0, width: {xs: 290, sm: 350}}} />
        <ComponentLoading width={250} height={22} borderRadius={1} sx={{ mb:0, display: {xs: 'none', md: 'block'}}} />
      </Box>
      <ComponentLoading width={175} height={14} borderRadius={1} sx={{mb: 2.5, mt: 1}}/>
      <ComponentLoading width={70} height={16} borderRadius={3} />
      <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxHeight: 24}}>
        <ComponentLoading width={558} height={18} borderRadius={1} sx={{ width: { xs: '95%', sm: 450 } }} />
        <ComponentLoading width={133} height={18} borderRadius={1} sx={{m:0, display: {xs: 'none', md: 'block'}}} />
      </Box>
  </Card>
);
}

export const PeriodsListSkeleton = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="subtitle2" sx={{mb:1}}>
        Periods with proposals / promotions
      </Typography>
      {[...Array(10)].map((_, idx) => (
        <PastPeriodCardSkeleton key={idx} />
      ))}
  </Box>
);

interface PeriodsListProps {
  periods: FrontendPeriod[];
}

export const PastPeriodsList = observer(({ periods}: PeriodsListProps) => {

  if (periods.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No periods with proposals or promotions found.
      </Typography>
    );
  }


  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Periods with proposals / promotions ({periods.length})
      </Typography>

      {periods.map((period, index) => {
        const nextPeriod = periods[index + 1];
        const hasGap = nextPeriod && (period.contract_voting_index - nextPeriod.contract_voting_index) > 1;

        return (
          <Fragment key={period.contract_voting_index}>
            <PastPeriodCard period={period} />
            {hasGap && (
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ textAlign: 'center', py: 1, fontStyle: 'italic' }}
              >
                No proposals or promotions for periods between {formatDate(nextPeriod.startDateTime, false)} - {formatDate(period.endDateTime, false)}
              </Typography>
            )}
          </Fragment>
        );
      })}
    </Box>
  );
});