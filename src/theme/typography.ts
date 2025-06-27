import { TypographyVariantsOptions } from "@mui/material";

export const typography: TypographyVariantsOptions = {
  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',

  h1: {
    fontSize: '2rem',
    fontWeight: 700,
    lineHeight: 1.2,
  },
  h2: {
    fontSize: '1.75rem',
    fontWeight: 700,
    lineHeight: 1.3,
  },
  h3: {
    fontSize: '1.5rem',
    fontWeight: 600,
    lineHeight: 1.3,
  },
  h4: {
    fontSize: '1.25rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h5: {
    fontSize: '1.125rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h6: {
    fontSize: '1rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },

  body1: {
    fontSize: '1rem',
    fontWeight: 400,
    lineHeight: 1.5,
  },
  body2: {
    fontSize: '0.875rem',
    fontWeight: 400,
    lineHeight: 1.5,
  },

  caption: {
    fontSize: '0.75rem',
    fontWeight: 400,
    lineHeight: 1.4,
  },

  button: {
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: 1.4,
    textTransform: 'none' as const,
  },

  subtitle1: {
    fontSize: '1rem',
    fontWeight: 500,
    lineHeight: 1.4,
  },
  subtitle2: {
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: 1.4,
  },

  code: {
    fontFamily: 'monospace',
    fontSize: '0.75rem',
    wordBreak: 'break-all' as const,
  },
  linkText: {
    fontSize: '1rem',
    fontWeight: 400,
    textDecoration: 'underline',
    cursor: 'pointer',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: 500,
    marginBottom: '4px',
  },
};