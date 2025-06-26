import { TypographyVariantsOptions } from "@mui/material";

const baseStyles = {
  fontFamily: 'Inter',
  lineHeight: '100%',
  letterSpacing: '-2%',
};

const headingStyle = {
  ...baseStyles,
  fontWeight: 600,
  fontSize: '28px',
};

const bodyStyle = {
  ...baseStyles,
  fontWeight: 400,
  fontSize: '18px',
};

const buttonStyle = {
  ...baseStyles,
  fontWeight: 600,
  fontSize: '18px',
  verticalAlign: 'middle',
  textTransform: 'none' as const,
};

export const typography: TypographyVariantsOptions = {
  fontFamily: [
    'Inter',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'sans-serif',
  ].join(','),

  h1: headingStyle,
  h2: headingStyle,
  h3: headingStyle,
  h4: headingStyle,
  h5: headingStyle,
  h6: headingStyle,

  body1: bodyStyle,
  body2: bodyStyle,

  button: buttonStyle,

  caption: {
    ...baseStyles,
    fontWeight: 400,
    fontSize: '14px',
  },

  overline: {
    ...baseStyles,
    fontWeight: 400,
    fontSize: '12px',
  },
};