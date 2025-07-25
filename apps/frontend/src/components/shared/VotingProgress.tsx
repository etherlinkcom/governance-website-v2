import { Box, darken, LinearProgress, Tooltip, Typography, useTheme } from '@mui/material';
import { InfoIcon } from './icons/InfoIcon';

interface VotingProgressProps {
  label: string;
  value: string;
  required: number;
  progress: number;
  color?: string;
  width?: number;
}

export const VotingProgress = ({
  label,
  value,
  required,
  progress,
  color,
  width = 250
}: VotingProgressProps) => {
    const theme = useTheme();
  const baseColor = color || theme.palette.primary.main;
  const hoverColor = darken(baseColor, 0.5);

  return (
    <Box
      sx={{
        textAlign: 'right',
        '& .info-icon': {
          color: baseColor,
        },
        '&:hover .info-icon': {
          color: hoverColor,
        },
      }}
    >
      <Tooltip title={`Current Voting Power: ${value}% / ${required}%`} placement="top" arrow={true}>
       <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
        <Typography variant="body1">{label}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body1">{value}% / {required}%</Typography>
          <InfoIcon className="info-icon" color={baseColor} />
        </Box>
      </Box>
      </Tooltip>
      <LinearProgress
        variant="determinate"
        value={progress}
        sx={{
          width,
          mb: 1
        }}
      />
    </Box>
  );
};