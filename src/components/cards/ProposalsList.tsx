import { Box, Typography } from '@mui/material';
import ProposalCard from './ProposalCard';

interface Proposal {
  id: string;
  title?: string;
  author: string;
  upvotes: string;
}

interface ProposalsListProps {
  proposals: Proposal[];
  quorum: string;
  onProposalClick?: (proposal: Proposal) => void;
}

const ProposalsList = ({ proposals, quorum, onProposalClick }: ProposalsListProps) => {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h2">
          Proposals
        </Typography>
        <Typography variant="body1">
          Quorum: {quorum}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {proposals.map((proposal) => (
          <ProposalCard
            key={proposal.id}
            proposal={proposal}
            onClick={onProposalClick}
          />
        ))}
      </Box>
    </Box>
  );
};

export default ProposalsList;