import { Typography, Link } from '@mui/material';
import { allLinkData } from '@/data/proposalLinks';

interface ProposalHashDisplayProps {
  hash: string;
  variant?: 'inline' | 'block';
  enableEllipsis?: boolean;
}

export const HashDisplay = ({ hash, variant = 'block', enableEllipsis = true }: ProposalHashDisplayProps) => {
  const linkData = allLinkData[hash];

  const ellipsisStyles = enableEllipsis ? {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  } : {};

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
          display: variant === 'block' ? 'block' : 'inline',
          ...ellipsisStyles
        }}
      >
        <Typography
          variant="body2"
          component={variant === 'inline' ? 'span' : 'div'}
          sx={ellipsisStyles}
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
      sx={ellipsisStyles}
    >
      {hash}
    </Typography>
  );
};