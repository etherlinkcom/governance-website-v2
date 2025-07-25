import { Link, Typography } from '@mui/material';
import { allLinkData, PayloadKey } from '@/data/proposalLinks';

interface HashLinkProps {
  hash: PayloadKey;
}

export function getLinkData(hash: PayloadKey) {
  return allLinkData.find(entry => {
    if (typeof entry.payloadKey === 'string') {
      return entry.payloadKey === hash;
    }
    if (typeof entry.payloadKey === 'object' && typeof hash === 'object') {
      return (
        entry.payloadKey.poolAddress === hash.poolAddress &&
        entry.payloadKey.sequencerPublicKey === hash.sequencerPublicKey
      );
    }
    return false;
  });
}

export const HashLink = ({
  hash,
}: HashLinkProps) => {
  const linkData = getLinkData(hash);

  if (!linkData) return null;

  return (
    <Link
      className='proposal-link'
      href={linkData.href}
      target="_blank"
      rel="noopener noreferrer"
    >
      <Typography
        variant="body2"
        component='div'
      >
        {linkData.title}
      </Typography>
    </Link>
  );
};