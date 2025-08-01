import { Box, SxProps, Typography } from '@mui/material';
import { PayloadKey } from '@/data/proposalLinks';
import { parseSequencerKey } from '@/lib/getLinkData';

interface HashDisplayProps {
  hash: PayloadKey;
  sx?: SxProps
}

export const HashDisplay = ({
  hash,
  sx
}: HashDisplayProps) => {

  let displayValue: React.ReactNode;

  if (typeof hash === 'string') {
    const parsed = parseSequencerKey(hash);
    if (parsed) {
      displayValue = (
        <Box sx={{...sx}}>
          <Box component="span">Pool Address: {parsed.poolAddress}</Box>
          <br />
          <Box component="span">Sequencer Public Key: {parsed.sequencerPublicKey}</Box>
        </Box>
      );
    } else {
      displayValue = hash;
    }

  } else {
    displayValue = (
      <Box sx={{...sx}}>
        <Box component="span">Pool Address: {hash.poolAddress ?? ''}</Box>
        <br />
        <Box component="span">Sequencer Public Key: {hash.sequencerPublicKey ?? ''}</Box>
      </Box>
    );
  }

  return (
    <Typography variant="body2" component="span" sx={{ wordBreak: 'break-all', ...sx }}>
      {displayValue}
    </Typography>
  );
};