import { Box, Typography, useTheme } from '@mui/material';
import { Fragment } from 'react';
import { observer } from 'mobx-react-lite';
import { Period } from '@trilitech/types';
import { PeriodCard } from '@/components/period/PeriodCard';
import { ComponentLoading } from '@/components/shared/ComponentLoading';

const PeriodCardSkeleton = () => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        borderRadius: '25px',
        p: 3,
        boxShadow: `0px 0px 6px 0px ${theme.palette.custom.shadow.primary}`,
    }}
  >
    <Box sx={{ mb: 2 }}>
      <ComponentLoading width="25%" height={20} borderRadius={1} />
    </Box>

    <Box sx={{ mb: 1 }}>
      <ComponentLoading width="40%" height={20} borderRadius={1} />
    </Box>

    <Box sx={{ mb: 2 }}>
      <ComponentLoading width="60%" height={16} borderRadius={1} />
    </Box>

    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
      <ComponentLoading width={80} height={24} borderRadius={3} />
      <ComponentLoading width={70} height={24} borderRadius={3} />
    </Box>

    <Box sx={{ mb: 1 }}>
      <ComponentLoading width="20%" height={18} borderRadius={1} />
    </Box>

    <ComponentLoading width="100%" height={16} borderRadius={1} />
  </Box>
);
}

const PeriodsListSkeleton = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <PeriodCardSkeleton key={1} />
  </Box>
);

interface PeriodsListProps {
  periods: Period[];
  isLoading: boolean;
}

export const PeriodsList = observer(({ periods, isLoading }: PeriodsListProps) => {
  if (isLoading) {
    return <PeriodsListSkeleton />;
  }

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
            <PeriodCard period={period} />
            {hasGap && (
              <Typography
                variant="subtitle2"
                color="text.secondary"
                sx={{ textAlign: 'center', py: 1, fontStyle: 'italic' }}
              >
                No proposals or promotions for periods {nextPeriod.contract_voting_index + 1} - {period.contract_voting_index - 1}
              </Typography>
            )}
          </Fragment>
        );
      })}
    </Box>
  );
});