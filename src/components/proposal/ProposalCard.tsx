import { formatNumberShort } from '@/utils/formatNumberShort';
import { ProcessedProposal } from '@/utils/getProposals';
import { Card, CardContent, Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface ProposalCardProps {
  proposal: ProcessedProposal;
}

export const ProposalCard = ({ proposal}: ProposalCardProps) => {
  const theme = useTheme();

  return (
    <Card
    // TODO components
      sx={{
        backgroundColor: 'background.paper',
        boxShadow: `0px 0px 6px 0px ${theme.palette.custom.shadow.primary}`,
        border: 'none',
        borderRadius: '25px',
        '&:hover': {
          boxShadow: `0px 0px 10px 2px ${theme.palette.custom.shadow.secondary}`,
          transform: 'translateY(-2px)',
          transition: 'all 0.2s ease-in-out',
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ mb: 1, display: 'block' }}>
              {"0x" + proposal.key?.toString()}
            </Typography>
            {/* TODO abstract url */}
            <Typography variant="subtitle2" component='a' target='_blank' href={`https://tzkt.io/${proposal.proposer}/operations/`} sx={{ mb: 1 }}>
              (by {proposal.proposer})
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="subtitle2">
              Upvotes:
            </Typography>
            <Typography variant="body1" sx={{ display: 'block' }}>
              {formatNumberShort(proposal.upvotesVotingPower)}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};