import { Link, SxProps } from '@mui/material';
import toast from 'react-hot-toast';

interface CopyCommandButtonProps {
  command: string;
  label: string;
  message?: string;
  sx?: SxProps;
}

export const CopyCommandButton = ({
  command,
  label,
  message = 'Command copied',
  sx,
}: CopyCommandButtonProps) => {
  const handleCopy = async (event: React.MouseEvent) => {
    try {
      event.stopPropagation();
      await navigator.clipboard.writeText(command);
      toast.dismiss();
      toast.success(message);
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy to clipboard');
    }
  };

  return (
    <Link
      component="button"
      type="button"
      onClick={handleCopy}
      sx={{
        color: 'primary.main',
        cursor: 'pointer',
        verticalAlign: 'baseline',
        ...sx,
      }}
    >
      {label}
    </Link>
  );
};
