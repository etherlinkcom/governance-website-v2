import { Card, CardContent, Box, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface Proposal {
  id: string;
  title?: string;
  author: string;
  upvotes: string;
}

interface ProposalCardProps {
  proposal: Proposal;
  onClick?: (proposal: Proposal) => void;
}

const ProposalCard = ({ proposal, onClick }: ProposalCardProps) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        backgroundColor: 'background.paper',
        boxShadow: `0px 0px 6px 0px ${theme.palette.custom.shadow.primary}`,
        border: 'none',
        borderRadius: '25px',
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': {
          boxShadow: `0px 0px 10px 2px ${theme.palette.custom.shadow.secondary}`,
          transform: 'translateY(-2px)',
          transition: 'all 0.2s ease-in-out',
        },
      }}
      onClick={() => onClick?.(proposal)}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="body2" sx={{ mb: 1, display: 'block' }}>
              {proposal.id}
            </Typography>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              (by {proposal.author})
            </Typography>
            {proposal.title && (
              <Typography variant="body1">
                {proposal.title}
              </Typography>
            )}
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="subtitle2">
              Upvotes:
            </Typography>
            <Typography variant="body1" sx={{ display: 'block' }}>
              {proposal.upvotes}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProposalCard;