import { createTheme } from '@mui/material/styles';
import { theme as paletteConfig } from './palette';
import { typography } from './typography';
import { breakpoints } from './breakpoints';
import { spacing } from './spacing';
import { components } from './components';

declare module '@mui/material/styles' {
  interface TypographyVariants {
    code: React.CSSProperties;
    linkText: React.CSSProperties;
    label: React.CSSProperties;
  }

  interface TypographyVariantsOptions {
    code?: React.CSSProperties;
    linkText?: React.CSSProperties;
    label?: React.CSSProperties;
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    code: true;
    linkText: true;
    label: true;
  }
}

export const theme = createTheme({
  palette: paletteConfig,
  typography,
  breakpoints,
  spacing,
  components,
  shape: {
    borderRadius: 8,
  },
});