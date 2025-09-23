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
    <Card sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
      <ComponentLoading width={80} height={20} borderRadius={1} sx={{mb: 1, mt: 1}} />
      <ComponentLoading width={200} height={16} borderRadius={1} />
      <ComponentLoading width={300} height={14} borderRadius={1} sx={{mb: 1}} />
      <ComponentLoading width={80} height={24} borderRadius={3} sx={{mb: 1}} />
      <ComponentLoading width={70} height={18} borderRadius={3} />
      <ComponentLoading width={450} height={18} borderRadius={1} sx={{ mb:2 }} />
  </Card>
);
}

const PeriodsListSkeleton = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <PastPeriodCardSkeleton />
  </Box>
);

interface PeriodsListProps {
  periods: FrontendPeriod[];
  isLoading: boolean;
}

export const PastPeriodsList = observer(({ periods, isLoading }: PeriodsListProps) => {

  if (isLoading) return <PeriodsListSkeleton />;

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