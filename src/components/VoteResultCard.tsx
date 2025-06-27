import { Box, Typography } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';

interface VoteResultCardProps {
  type: 'yea' | 'nay' | 'pass';
  percentage: number;
  count: number;
  label: string;
}

const VoteResultCard = ({ type, percentage, count, label }: VoteResultCardProps) => {
  const theme = useTheme();

  const getThemeColors = () => {
    switch (type) {
      case 'yea':
        return {
          main: theme.palette.success.main,
          contrast: theme.palette.success.contrastText,
          icon: '✓'
        };
      case 'nay':
        return {
          main: theme.palette.error.main,
          contrast: theme.palette.error.contrastText,
          icon: '✕'
        };
      case 'pass':
        return {
          main: theme.palette.warning.main,
          contrast: theme.palette.warning.contrastText,
          icon: '–'
        };
    }
  };

  const colors = getThemeColors();

  return (
    <Box
      sx={{
        flex: 1,
        border: `1px solid ${colors.main}`,
        borderRadius: '4px',
        p: 2,
        textAlign: 'center',
        backgroundColor: alpha(colors.main, 0.1)
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
        <Box sx={{
          width: 16,
          height: 16,
          borderRadius: '50%',
          backgroundColor: colors.main,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Typography sx={{ fontSize: '12px', color: colors.contrast }}>
            {colors.icon}
          </Typography>
        </Box>
        <Typography variant="body1" sx={{ fontWeight: 600, color: `${colors.main} !important` }}>
          {percentage}% ({count} {label})
        </Typography>
      </Box>
      <Typography variant="subtitle2" sx={{ textTransform: 'capitalize' }}>
        {type}
      </Typography>
    </Box>
  );
};

export default VoteResultCard;