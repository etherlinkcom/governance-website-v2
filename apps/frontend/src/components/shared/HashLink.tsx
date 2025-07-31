import { Link, SxProps } from '@mui/material';
import { PayloadKey } from '@/data/proposalLinks';
import { getLinkData } from '@/lib/getLinkData';

interface HashLinkProps {
  hash: PayloadKey;
  sx?: SxProps
}

export const HashLink = ({
  hash,
  sx
}: HashLinkProps) => {
  const linkData = getLinkData(hash);

  if (!linkData) return null;

  return (
    <Link
      className='proposal-link'
      href={linkData.href}
      target="_blank"
      rel="noopener noreferrer"
      sx={{...sx}}
    >
        {linkData.title}
    </Link>
  );
};