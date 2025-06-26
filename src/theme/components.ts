import { Components, Theme } from '@mui/material/styles';
import { typography } from './typography';

export const components: Components<Theme> = {
  MuiButton: {
    styleOverrides: {
      root: ({ theme }) => ({
        fontFamily: typography.fontFamily,
        fontWeight: typography.button?.fontWeight,
        fontSize: typography.button?.fontSize,
        lineHeight: typography.button?.lineHeight,
        letterSpacing: typography.button?.letterSpacing,
        verticalAlign: 'middle',
        textTransform: 'none',
        borderRadius: 8,
        padding: '12px 24px',
        transition: 'all 0.2s ease-in-out',
        border: '2px solid',
        borderImageSource: 'radial-gradient(50% 32.35% at 0% 50%, #38FF9C 0%, rgba(56, 255, 156, 0) 100%)',
      }),
      contained: ({ theme }) => ({
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        boxShadow: `0px 0px 6px 0px ${theme.palette.primary.main}`,
        '&:hover': {
          backgroundColor: theme.palette.primary.main,
          boxShadow: `0px 0px 8px 2px ${theme.palette.primary.main}`,
          transform: 'translateY(-1px)',
        },
      }),
      outlined: ({ theme }) => ({
        backgroundColor: 'transparent',
        color: theme.palette.primary.main,
        boxShadow: `0px 0px 6px 0px ${theme.palette.primary.main}`,
        '&:hover': {
          backgroundColor: `rgba(56, 255, 156, 0.1)`,
          transform: 'translateY(-1px)',
        },
      }),
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: ({ theme }) => ({
        backgroundColor: theme.palette.background.paper,
        backdropFilter: 'blur(12px)',
        backgroundImage: 'none',
        border: '2px solid',
        borderImageSource: 'radial-gradient(50% 32.35% at 0% 50%, #38FF9C 0%, rgba(56, 255, 156, 0) 100%)',
        borderRadius: 12,
      }),
    },
  },
  MuiCard: {
    styleOverrides: {
      root: ({ theme }) => ({
        backgroundColor: theme.palette.background.paper,
        backdropFilter: 'blur(12px)',
        border: '2px solid',
        borderImageSource: 'radial-gradient(50% 32.35% at 0% 50%, #38FF9C 0%, rgba(56, 255, 156, 0) 100%)',
        borderRadius: 12,
      }),
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: ({ theme }) => ({
        '& .MuiOutlinedInput-root': {
          backgroundColor: 'rgba(27, 27, 27, 0.8)',
          fontFamily: typography.fontFamily,
          fontSize: typography.body1?.fontSize,
          fontWeight: typography.body1?.fontWeight,
          '& fieldset': {
            borderColor: 'rgba(56, 255, 156, 0.3)',
          },
          '&:hover fieldset': {
            borderColor: theme.palette.primary.main,
          },
          '&.Mui-focused fieldset': {
            borderColor: theme.palette.primary.main,
            boxShadow: `0px 0px 4px 0px ${theme.palette.primary.main}`,
          },
        },
        '& .MuiInputLabel-root': {
          color: theme.palette.text.secondary,
          fontFamily: typography.fontFamily,
          '&.Mui-focused': {
            color: theme.palette.primary.main,
          },
        },
        '& .MuiOutlinedInput-input': {
          color: theme.palette.text.primary,
        },
      }),
    },
  },
  MuiTypography: {
    styleOverrides: {
      h1: ({ theme }) => ({
        color: theme.palette.text.primary,
      }),
      h2: ({ theme }) => ({
        color: theme.palette.text.primary,
      }),
      h3: ({ theme }) => ({
        color: theme.palette.text.primary,
      }),
      h4: ({ theme }) => ({
        color: theme.palette.text.primary,
      }),
      h5: ({ theme }) => ({
        color: theme.palette.text.primary,
      }),
      h6: ({ theme }) => ({
        color: theme.palette.text.primary,
      }),
      body1: ({ theme }) => ({
        color: theme.palette.text.secondary,
      }),
      body2: ({ theme }) => ({
        color: theme.palette.text.secondary,
      }),
    },
  },
  MuiCssBaseline: {
    styleOverrides: (theme) => ({
      body: {
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
        fontFamily: typography.fontFamily,
        backgroundImage: 'url(/backgrounds/Background1.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      },
      '*::-webkit-scrollbar': {
        width: '8px',
      },
      '*::-webkit-scrollbar-track': {
        backgroundColor: 'rgba(27, 27, 27, 0.1)',
      },
      '*::-webkit-scrollbar-thumb': {
        backgroundColor: 'rgba(56, 255, 156, 0.3)',
        borderRadius: '4px',
      },
      '*::-webkit-scrollbar-thumb:hover': {
        backgroundColor: 'rgba(56, 255, 156, 0.5)',
      },
    }),
  },
};