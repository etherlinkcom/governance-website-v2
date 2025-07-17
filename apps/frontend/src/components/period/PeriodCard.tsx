import { Card, CardContent, Box, Typography, Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Period } from '@trilitech/types';

interface PeriodCardProps {
  period: Period;
}

export const PeriodCard = ({ period }: PeriodCardProps) => {
  const theme = useTheme();
  const isCurrentPeriod = period.period_class === 'current';
  const isFuture = period.period_class === 'future';

  const formatDate = (date: Date | string): string => {
    if (typeof date === 'string') {
      date = new Date(date);
    }
    return date.toLocaleDateString();
  };

  const hasProposals = period.proposal_hashes && period.proposal_hashes.length > 0;
  const hasPromotion = period.promotion_hash;

  if (isFuture) {
    return (
      <Card variant="outlined" sx={{ py: 1, px: 2,  }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Period {period.contract_voting_index}
            </Typography>
            <Chip label="Future" size="small" variant="outlined" color="info" />
          </Box>
          <Box sx={{ textAlign: 'right', mb: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Levels: {period.level_start.toLocaleString()} - {period.level_end.toLocaleString()}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              {formatDate(period.date_start)} - {formatDate(period.date_end)}
            </Typography>
          </Box>
        </Box>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        ...(isCurrentPeriod && {
          border: '2px solid',
          borderColor: 'warning.main',
          boxShadow: `0px 0px 15px 3px ${theme.palette.warning.main}30`,
          transform: 'scale(1.02)',
        }),
        transition: 'all 0.3s ease-in-out',
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ mb: 1, display: 'block' }}>
              Period {period.contract_voting_index}{' '}
            {isCurrentPeriod && (
                <Chip
                  label="Current"
                  color="warning"
                  variant="filled"
                  size="small"
                  sx={{ mt: -0.5, ml: 1 }}
                />
              )}
            </Typography>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Levels: {period.level_start.toLocaleString()} - {period.level_end.toLocaleString()}
            </Typography>
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              Start: {formatDate(period.date_start)} - End: {formatDate(period.date_end)}
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
              {hasProposals && (
                <Chip
                  label={`${period.proposal_hashes?.length} Proposal`}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
              )}
              {hasPromotion && (
                <Chip
                  label="Promotion"
                  size="small"
                  color="secondary"
                  variant="outlined"
                />
              )}
              {!hasProposals && !hasPromotion && (
                <Typography variant="body1" color="text.secondary">
                  No Proposals or Promotions for current period
                </Typography>
              )}
            </Box>

            {hasProposals && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Proposals:
                </Typography>
                {period.proposal_hashes?.map((hash, index) => (
                  <Typography
                    key={index}
                    variant="body2"
                    sx={{
                      fontFamily: 'monospace',
                      fontSize: '0.75rem',
                      mb: 0.5,
                      wordBreak: 'break-all'
                    }}
                  >
                    {hash}
                  </Typography>
                ))}
              </Box>
            )}

            {hasPromotion && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Promotion:
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    fontFamily: 'monospace',
                    fontSize: '0.75rem',
                    wordBreak: 'break-all'
                  }}
                >
                  {period.promotion_hash}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};