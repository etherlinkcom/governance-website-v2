import { Box, Typography } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { contractStore } from '@/stores/ContractStore2';
import {ProposalsList} from '@/components/proposal/ProposalsList';
import {UpvotersTable} from '@/components/proposal/UpvotersTable';
import {ComponentLoading} from '@/components/shared/ComponentLoading';

const ProposalsViewSkeleton = () => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Proposals Section Skeleton */}
      <Box>
        <ComponentLoading width={150} height={28} />
        <Box sx={{ mt: 2 }}>
          <ComponentLoading width="100%" height={200} borderRadius={2} />
        </Box>
      </Box>

      {/* Upvoters Section Skeleton */}
      <Box>
        <ComponentLoading width={100} height={28} />
        <Box sx={{ mt: 2 }}>
          <ComponentLoading width="100%" height={300} borderRadius={2} />
        </Box>
      </Box>
    </Box>
  );
};

export const ProposalsView = observer(() => {

  const {error} = contractStore;

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ color: 'error.main' }}>
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Proposals Section */}
      <ProposalsList/>

      {/* Upvoters Section */}
      <Box>
        <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
          Upvoters
        </Typography>
        <UpvotersTable />
      </Box>
    </Box>
  );
});
