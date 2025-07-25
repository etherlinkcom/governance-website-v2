import { Typography } from '@mui/material';
import { PayloadKey } from '@/data/proposalLinks';
import { parseSequencerKey } from '@/lib/getLinkData';

interface HashDisplayProps {
  hash: PayloadKey;
  enableEllipsis?: boolean;
}

export const HashDisplay = ({
  hash,
}: HashDisplayProps) => {
  let displayValue: React.ReactNode;
  if (typeof hash === 'string') {
    const parsed = parseSequencerKey(hash);
    if (parsed) {
      displayValue = (
        <>
          <span>Pool Address: {parsed.poolAddress}</span>
          <br />
          <span>Sequencer Public Key: {parsed.sequencerPublicKey}</span>
        </>
      );
    } else {
      displayValue = hash;
    }
  } else {
    displayValue = (
      <>
        <span>Pool Address: {hash.poolAddress ?? ''}</span>
        <br />
        <span>Sequencer Public Key: {hash.sequencerPublicKey ?? ''}</span>
      </>
    );
  }

  return (
    <Typography variant="body2" component="div" sx={{ wordBreak: 'break-all' }}>
      {displayValue}
    </Typography>
  );
};