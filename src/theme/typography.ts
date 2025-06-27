import { TypographyVariantsOptions } from "@mui/material";

export const typography: TypographyVariantsOptions = {
  fontFamily: 'Inter, system-ui, -apple-system, sans-serif',

  h1: {
    fontSize: '2rem',
    fontWeight: 700,
    lineHeight: 1.2,
    color: '#FFFFFF',
  },
  h2: {
    fontSize: '1.75rem',
    fontWeight: 700,
    lineHeight: 1.3,
    color: '#FFFFFF',
  },
  h3: {
    fontSize: '1.5rem',
    fontWeight: 600,
    lineHeight: 1.3,
    color: '#FFFFFF',
  },
  h4: {
    fontSize: '1.25rem',
    fontWeight: 600,
    lineHeight: 1.4,
    color: '#FFFFFF',
  },
  h5: {
    fontSize: '1.125rem',
    fontWeight: 600,
    lineHeight: 1.4,
    color: '#FFFFFF',
  },
  h6: {
    fontSize: '1rem',
    fontWeight: 600,
    lineHeight: 1.4,
    color: '#FFFFFF',
  },

  body1: {
    fontSize: '1rem',
    fontWeight: 400,
    lineHeight: 1.5,
    color: '#A3FFD1',
  },
  body2: {
    fontSize: '0.875rem',
    fontWeight: 400,
    lineHeight: 1.5,
    color: '#A3FFD1',
  },
  caption: {
    fontSize: '0.75rem',
    fontWeight: 400,
    lineHeight: 1.4,
    color: '#888888',
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
    color: '#888888',
  },
  subtitle2: {
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: 1.4,
    color: '#888888',
  },

  code: {
    fontFamily: 'monospace',
    fontSize: '0.75rem',
    color: '#A3FFD1',
    wordBreak: 'break-all' as const,
  },
  linkText: {
    fontSize: '1rem',
    fontWeight: 400,
    color: '#38FF9C',
    textDecoration: 'underline',
    cursor: 'pointer',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: 500,
    color: '#888888',
    marginBottom: '4px',
  },
};