import { Card, CardContent, Box, Typography, Chip } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Period } from '@trilitech/types';
import { useState } from 'react';
import { PeriodDetailsModal } from './PeriodDetailsModal';
import { formatDate } from '@/lib/formatDate';
import { HashDisplay } from '@/components/shared/HashDisplay';
import { getLinkData, HashLink } from '@/components/shared/HashLink';
import { PayloadKey } from '@/data/proposalLinks';

interface PeriodCardProps {
  period: Period;
}

export const PeriodCard = ({ period }: PeriodCardProps) => {
  const theme = useTheme();
  const [modalOpen, setModalOpen] = useState(false);
  const isCurrentPeriod = period.period_class === 'current';
  const isFuture = period.period_class === 'future';

  const hasProposals = period.proposal_hashes && period.proposal_hashes.length > 0;
  const hasPromotion = period.promotion_hash;

  const handleCardClick = () => {
    if (hasProposals || hasPromotion) {
      setModalOpen(true);
    }
  };

  if (isFuture) {
    return (
      <Card variant="outlined" sx={{ py: 1, px: 2 }}>
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


function renderHash(hash: PayloadKey) {
  const linkData = getLinkData(hash);
  if (linkData) return <HashLink hash={hash} />;
  return <HashDisplay hash={hash} />;
}

  return (
    <>
    <Card
      onClick={handleCardClick}
      sx={{
        ...(isCurrentPeriod && {
          border: '2px solid',
          borderColor: 'primary.main',
          boxShadow: `0px 0px 15px 3px ${theme.palette.primary.main}30`,
          transform: 'scale(1.02)',
        }),
        transition: 'all 0.3s ease-in-out',
        cursor: hasProposals || hasPromotion ? 'pointer' : 'default',
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ mb: 1, display: 'block' }}>
              Period {period.contract_voting_index}{' '}
            {isCurrentPeriod && (
                <Chip
                  component='span'
                  label="Current"
                  color="primary"
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
                  <Box key={index}>
                    {renderHash(hash)}
                  </Box>
                ))}
              </Box>
            )}

            {hasPromotion && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Promotion:
                </Typography>
                {renderHash(period.promotion_hash || '')}
              </Box>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>

      <PeriodDetailsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        period={period}
      />
      </>
  );
};