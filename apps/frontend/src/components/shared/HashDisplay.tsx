import { Typography } from '@mui/material';
import { PayloadKey } from '@/data/proposalLinks';

interface HashDisplayProps {
  hash: PayloadKey;
  enableEllipsis?: boolean;
}

export const HashDisplay = ({
  hash,
}: HashDisplayProps) => {
  let displayValue = typeof hash === 'string'
    ? hash
    : `${hash.poolAddress ?? ''}${hash.sequencerPublicKey ? `:${hash.sequencerPublicKey}` : ''}`;

  return (
    <Typography
      variant="body2"
      component="div"
      title={displayValue}
    >
      {displayValue}
    </Typography>
  );
};