import { Box, Typography } from '@mui/material';
import { observer } from 'mobx-react-lite';
import {ProposalsList} from '@/components/proposal/ProposalsList';
import {UpvotersTable} from '@/components/proposal/UpvotersTable';


interface ProposalsViewProps {
  contractVotingIndex?: number;
  contractAddress?: string;
}

export const ProposalsView = observer(({ contractVotingIndex, contractAddress }: ProposalsViewProps) => {

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <ProposalsList
        contractVotingIndex={contractVotingIndex}
        contractAddress={contractAddress}
      />

      <Box>
        <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
          Upvoters
        </Typography>
        <UpvotersTable
          contractVotingIndex={contractVotingIndex}
          contractAddress={contractAddress}
        />
      </Box>
    </Box>
  );
});