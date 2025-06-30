import { Box, useTheme, alpha } from '@mui/material';

interface ComponentLoadingProps {
  width?: string | number;
  height?: number;
  borderRadius?: number;
}

const ComponentLoading = ({
  width = '100%',
  height = 20,
  borderRadius = 1
}: ComponentLoadingProps) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        width,
        height,
        borderRadius: theme.spacing(borderRadius),
        backgroundColor: alpha(theme.palette.primary.main, 0.1),
        animation: 'pulse 2s ease-in-out infinite',
        '@keyframes pulse': {
          '0%, 100%': {
            opacity: 1,
          },
          '50%': {
            opacity: 0.5,
          },
        },
      }}
    />
  );
};

export default ComponentLoading;