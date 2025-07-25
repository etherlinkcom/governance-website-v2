import { Typography } from '@mui/material';
import { PayloadKey } from '@/data/proposalLinks';
import { HashLink } from './HashLink';
import { getLinkData, parseSequencerKey } from '@/lib/getLinkData';

interface HashDisplayProps {
  hash: PayloadKey;
  enableEllipsis?: boolean;
}

export const HashDisplay = ({
  hash,
}: HashDisplayProps) => {
  const linkData = getLinkData(hash);

  if (linkData) {
    return <HashLink hash={hash} />;
  }

  let displayValue: React.ReactNode;
  if (typeof hash === 'string') {
    const parsed = parseSequencerKey(hash);
    if (parsed) {
      displayValue = (
        <>
          <span>{parsed.poolAddress}</span>
          <br />
          <span>{parsed.sequencerPublicKey}</span>
        </>
      );
    } else {
      displayValue = hash;
    }
  } else {
    displayValue = (
      <>
        <span>{hash.poolAddress ?? ''}</span>
        <br />
        <span>{hash.sequencerPublicKey ?? ''}</span>
      </>
    );
  }

  return (
    <Typography variant="body2" component="div" sx={{ wordBreak: 'break-all' }}>
      {displayValue}
    </Typography>
  );
};