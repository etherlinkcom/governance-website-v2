import { Box, Typography } from '@mui/material';
import { observer } from 'mobx-react-lite';
import {ProposalsList} from '@/components/proposal/ProposalsList';
import {UpvotersTable} from '@/components/proposal/UpvotersTable';


interface ProposalsViewProps {
  contractVotingIndex: number;
  contractAddress: string;
  isCurrentPeriod?: boolean;
}

export const ProposalsView = observer(({ contractVotingIndex, contractAddress, isCurrentPeriod }: ProposalsViewProps) => {

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <ProposalsList
        contractVotingIndex={contractVotingIndex}
        contractAddress={contractAddress}
        isCurrentPeriod={isCurrentPeriod}
      />

      <Box>
        <Typography variant="h5" component="h2" sx={{ mb: 2, ml: 2 }}>
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