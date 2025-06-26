import { createTheme } from '@mui/material/styles';
import { theme as paletteConfig } from './palette';
import { typography } from './typography';
import { breakpoints } from './breakpoints';
import { spacing } from './spacing';
import { components } from './components';

const baseTheme = createTheme({
  palette: paletteConfig,
  typography,
  breakpoints,
  spacing,
  components,
  shape: {
    borderRadius: 8,
  },
});

export const theme = createTheme({
  ...baseTheme,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          backgroundColor: baseTheme.palette.primary.main,
          color: baseTheme.palette.primary.contrastText,
          border: `1px solid ${baseTheme.palette.primary.main}`,
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          boxShadow: `0px 0px 6px 0px ${baseTheme.palette.primary.main}`,
          '&:hover': {
            backgroundColor: baseTheme.palette.primary.main,
            boxShadow: `0px 0px 8px 2px ${baseTheme.palette.primary.main}`,
          },
        },
        outlined: {
          backgroundColor: 'transparent',
          color: baseTheme.palette.primary.main,
          border: `1px solid ${baseTheme.palette.primary.main}`,
          boxShadow: `0px 0px 6px 0px ${baseTheme.palette.primary.main}`,
          '&:hover': {
            backgroundColor: `rgba(56, 255, 156, 0.1)`,
            border: `1px solid ${baseTheme.palette.primary.main}`,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundColor: baseTheme.palette.background.default,
          backdropFilter: 'blur(12px)',
          backgroundImage: 'none',
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        h1: { color: baseTheme.palette.text.primary },
        h2: { color: baseTheme.palette.text.primary },
        h3: { color: baseTheme.palette.text.primary },
        h4: { color: baseTheme.palette.text.primary },
        h5: { color: baseTheme.palette.text.primary },
        h6: { color: baseTheme.palette.text.primary },
        body1: { color: baseTheme.palette.text.secondary },
        body2: { color: baseTheme.palette.text.secondary },
      },
    },
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: baseTheme.palette.background.default,
          color: baseTheme.palette.text.primary,
        },
      },
    },
  },
});