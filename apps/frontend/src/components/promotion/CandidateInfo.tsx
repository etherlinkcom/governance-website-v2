import { contractStore } from '@/stores/ContractStore';
import { Box, Typography, useTheme } from '@mui/material';
import { observer } from 'mobx-react-lite';
import {ComponentLoading} from '@/components/shared/ComponentLoading';

const CandidateInfoSkeleton = () => {
  const theme = useTheme();
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2">
        Candidate:
      </Typography>
      <Box sx={{ mb: 1 }}>
        <ComponentLoading width={120} height={20} borderRadius={1} />
      </Box>
      <ComponentLoading width={180} height={24} borderRadius={1} />
      <Box sx={{ display: 'flex', gap: 4, mt: 3 }}>
        <Box>
          <Typography variant="subtitle2">
            Quorum:
          </Typography>
          <ComponentLoading width={60} height={20} borderRadius={1} />
        </Box>
        <Box>
          <Typography variant="subtitle2">
            Supermajority:
          </Typography>
          <ComponentLoading width={80} height={20} borderRadius={1} />
        </Box>
      </Box>
    </Box>
  );
};

export const CandidateInfo = observer(() => {
  const { promotion, isLoading } = contractStore;

  if (isLoading) return <CandidateInfoSkeleton />;

  if (!promotion) {
    return (
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          No candidate information available.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="subtitle2">
        Candidate:
      </Typography>
      <Typography variant="body2" sx={{ mb: 1 }}>
        {promotion.candidate}
      </Typography>
      <Typography variant="subtitle1">
        {promotion.title}
      </Typography>

      {/* Stats */}
      <Box sx={{ display: 'flex', gap: 4, mt: 3 }}>
        <Box>
          <Typography variant="subtitle2">
            Quorum:
          </Typography>
          <Typography variant="body1">
            {promotion.quorum}
          </Typography>
        </Box>
        <Box>
          <Typography variant="subtitle2">
            Supermajority:
          </Typography>
          <Typography variant="body1" >
            {promotion.supermajority}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
});
