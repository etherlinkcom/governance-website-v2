import { TypographyVariantsOptions } from '@mui/material/styles';

const baseStyles = {
  fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", sans-serif, "system-ui", "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
  color: 'inherit',
};

const headingStyle = {
  ...baseStyles,
  fontWeight: 700,
  fontSize: '2.5rem',
  '@media (max-width:900px)': {
    fontSize: '2rem',
  },
};

const bodyStyle = {
  ...baseStyles,
  fontWeight: 400,
  fontSize: '1rem',
  lineHeight: 1.6,
};

const buttonStyle = {
  ...baseStyles,
  fontWeight: 500,
  fontSize: '0.875rem',
  lineHeight: 1.75,
  letterSpacing: '0.02857em',
};

export const typography: TypographyVariantsOptions = {
  fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, Ubuntu, Cantarell, "Noto Sans", sans-serif, "system-ui", "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',

  h1: headingStyle,
  h2: headingStyle,
  h3: headingStyle,
  h4: headingStyle,
  h5: headingStyle,
  h6: {
    ...baseStyles,
    fontWeight: 600,
    fontSize: '1.25rem',
    '@media (max-width:900px)': {
      fontSize: '1rem',
    },
  },

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