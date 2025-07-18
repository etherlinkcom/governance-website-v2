import { Typography, Link } from '@mui/material';
import { allLinkData } from '@/data/proposalLinks';

interface ProposalHashDisplayProps {
  hash: string;
  variant?: 'inline' | 'block';
}

export const HashDisplay = ({ hash, variant = 'block' }: ProposalHashDisplayProps) => {
  const linkData = allLinkData[hash];

  if (linkData) {
    return (
      <Link
        href={linkData.href}
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          color: 'primary.main',
          textDecoration: 'none',
          '&:hover': { textDecoration: 'underline' },
          display: variant === 'block' ? 'block' : 'inline'
        }}
      >
        <Typography
          variant="body2"
          component={variant === 'inline' ? 'span' : 'div'}
        >
          {linkData.title}
        </Typography>
      </Link>
    );
  }

  return (
    <Typography
      variant="body2"
      component={variant === 'inline' ? 'span' : 'div'}
      sx={{wordBreak: 'break-all'}}
    >
      {hash}
    </Typography>
  );
};