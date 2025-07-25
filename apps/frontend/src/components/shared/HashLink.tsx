import { Link, Typography } from '@mui/material';
import { PayloadKey } from '@/data/proposalLinks';
import { getLinkData } from '@/lib/getLinkData';

interface HashLinkProps {
  hash: PayloadKey;
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
      <Typography variant="body2" component='div'>
        {linkData.title}
      </Typography>
    </Link>
  );
};