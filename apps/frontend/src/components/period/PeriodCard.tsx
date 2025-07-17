import { Card, CardContent, Box, Typography, Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Period } from '@trilitech/types';

interface PeriodCardProps {
  period: Period;
}

export const PeriodCard = ({ period }: PeriodCardProps) => {
  const theme = useTheme();

  const formatDate = (date: Date | string): string => {
    if (typeof date === 'string') {
      date = new Date(date);
    }
    return date.toLocaleDateString();
  };

  const hasProposals = period.proposal_hashes && period.proposal_hashes.length > 0;
  const hasPromotion = period.promotion_hash;

  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ mb: 1, display: 'block' }}>
              Period {period.contract_voting_index}
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