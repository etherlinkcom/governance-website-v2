// /apps/frontend/src/components/shared/HashDisplay.tsx
import { Typography, Link, Box } from '@mui/material';
import { allLinkData } from '@/data/proposalLinks';

interface ProposalHashDisplayProps {
  hash: string;
  variant?: 'inline' | 'block';
  enableEllipsis?: boolean;
}

export interface SequencerKey {
  pool_address: string;
  sequencer_pk: string;
}

export const HashDisplay = ({ hash, variant = 'block', enableEllipsis = true }: ProposalHashDisplayProps) => {

  const parseHashIfNeeded = (value: any): string | SequencerKey => {
    if (typeof value !== 'string') return String(value);

    try {
      const parsed = JSON.parse(value);

      if (parsed && typeof parsed === 'object' &&
          parsed.pool_address && parsed.sequencer_pk) {
        return parsed as SequencerKey;
      }

      return typeof parsed === 'object' ? value : parsed;
    } catch {
      return value;
    }
  };

  const parsedHash = parseHashIfNeeded(hash);
  const linkData = allLinkData[parsedHash.toString()];

  const ellipsisStyles = enableEllipsis ? {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  } : {};

  if (typeof parsedHash === 'object' && 'pool_address' in parsedHash) {
    return (
      <Box sx={{ display: variant === 'inline' ? 'inline-flex' : 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Typography
          variant="body2"
          component={variant === 'inline' ? 'span' : 'div'}
          sx={{ fontWeight: 'medium', ...ellipsisStyles }}
        >
          Pool: {parsedHash.pool_address}
        </Typography>
        <Typography
          variant="body2"
          component={variant === 'inline' ? 'span' : 'div'}
          sx={{ color: 'text.secondary', fontSize: '0.875rem', ...ellipsisStyles }}
        >
          PK: {parsedHash.sequencer_pk}
        </Typography>
      </Box>
    );
  }

  if (linkData && typeof parsedHash === 'string') {
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
      {String(parsedHash)}
    </Typography>
  );
};