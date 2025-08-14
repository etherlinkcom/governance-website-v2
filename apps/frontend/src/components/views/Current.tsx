import { observer } from 'mobx-react-lite';
import { Box, Typography, Button, Card, CardContent, LinearProgress } from '@mui/material';
import { contractStore } from '@/stores/ContractStore';
import { formatDate } from '@/lib/formatDate';
import { getWalletStore } from '@/stores/WalletStore';
import { useEffect, useState } from 'react';

export const Current = observer(() => {
  const currentPeriod = contractStore.currentPeriodData;
  const isLoading = contractStore.isLoadingCurrentPeriod;
  const walletStore = getWalletStore();

  const [timeRemaining, setTimeRemaining] = useState('00:00');
  const [progressPercentage, setProgressPercentage] = useState(0);

  useEffect(() => {
    if (!currentPeriod) return;

    const updateTimer = () => {
      const now = new Date();
      const endTime = new Date(currentPeriod.endDateTime);
      const startTime = new Date(currentPeriod.startDateTime);

      const timeDiff = endTime.getTime() - now.getTime();

      if (timeDiff <= 0) {
        setTimeRemaining('00:00');
        setProgressPercentage(100);
        return;
      }

      // Calculate time remaining
      const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

      if (days > 0) {
        setTimeRemaining(`${days}d ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
      } else {
        setTimeRemaining(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`);
      }

      // Calculate progress percentage
      const totalDuration = endTime.getTime() - startTime.getTime();
      const elapsed = now.getTime() - startTime.getTime();
      const percentage = Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
      setProgressPercentage(percentage);
    };

    // Update immediately
    updateTimer();

    // Update every minute
    const interval = setInterval(updateTimer, 60000);

    return () => clearInterval(interval);
  }, [currentPeriod]);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <Typography>Loading current period...</Typography>
      </Box>
    );
  }

  if (!currentPeriod) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <Typography variant="h6" color="text.secondary">
          Empty Period
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', mx: 'auto' }}>
      <Card sx={{ p: 3, height: '600px', borderRadius: '16px' }}>
        <CardContent>
          <Typography variant="body1" sx={{ mb: 2 }}>
            <strong>Start</strong> {formatDate(currentPeriod.startDateTime)} - <strong>End:</strong> {formatDate(currentPeriod.endDateTime)}
          </Typography>

          <Typography variant="body1" sx={{ mb: 2 }}>
            <strong>Levels</strong> {currentPeriod.startLevel.toLocaleString()} - {currentPeriod.endLevel.toLocaleString()}
          </Typography>

          {/* Time Remaining - moved under levels with same width */}
          <Box sx={{ mb: 3, width: '250px' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2">
                Time Remaining:
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {timeRemaining}
              </Typography>
            </Box>

            <LinearProgress
              variant="determinate"
              value={progressPercentage}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: 'rgba(255,255,255,0.1)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 4,
                }
              }}
            />
          </Box>

          {/* Proposal Status */}
          <Typography variant="body1" sx={{ mb: 3, textAlign: 'left' }}>
            No Proposals Currently
          </Typography>

          {/* Action Button */}
          <Box sx={{ display: 'flex', justifyContent: 'left' }}>
            <Button
              variant="outlined"
              size="large"
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: '12px',
                textTransform: 'none',
                fontSize: '1rem'
              }}
            >
              {
                walletStore?.address ? 'Submit Proposal' : 'Connect'
              }
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
});