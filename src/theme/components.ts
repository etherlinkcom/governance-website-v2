import { Components, Theme, alpha } from '@mui/material/styles';
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
        borderRadius: '50px',
        padding: '12px 24px',
        transition: 'all 0.2s ease-in-out',
        border: '2px solid',
        borderImageSource: `radial-gradient(50% 32.35% at 0% 50%, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.main, 0)} 100%)`,
        gap: theme.spacing(1),
        textAlign: 'center',
        whiteSpace: 'normal',
        wordWrap: 'break-word',
      }),
      contained: ({ theme }) => ({
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        boxShadow: `0px 0px 3px 0px ${theme.palette.primary.main}`,
        '&:hover': {
          backgroundColor: theme.palette.primary.main,
          boxShadow: `0px 0px 8px 2px ${theme.palette.primary.main}`,
          transform: 'translateY(-1px)',
        },
      }),
      outlined: ({ theme }) => ({
        backgroundColor: 'transparent',
        color: theme.palette.primary.main,
        boxShadow: `0px 0px 3px 0px ${theme.palette.primary.main}`,
        '&:hover': {
          backgroundColor: alpha(theme.palette.primary.main, 0.1),
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
        borderImageSource: `radial-gradient(50% 32.35% at 0% 50%, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.main, 0)} 100%)`,
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
        borderImageSource: `radial-gradient(50% 32.35% at 0% 50%, ${theme.palette.primary.main} 0%, ${alpha(theme.palette.primary.main, 0)} 100%)`,
        borderRadius: 12,
      }),
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: ({ theme }) => ({
        '& .MuiOutlinedInput-root': {
          backgroundColor: alpha(theme.palette.background.default, 0.8),
          fontFamily: typography.fontFamily,
          fontSize: typography.body1?.fontSize,
          fontWeight: typography.body1?.fontWeight,
          '& fieldset': {
            borderColor: alpha(theme.palette.primary.main, 0.3),
          },
          '&:hover fieldset': {
            borderColor: theme.palette.primary.main,
          },
          '&.Mui-focused fieldset': {
            borderColor: theme.palette.primary.main,
            boxShadow: `0px 0px 3px 0px ${theme.palette.primary.main}`,
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
      root: ({ theme }) => ({
        fontFamily: typography.fontFamily,
        '&.MuiTypography-linkText:hover': {
          opacity: 0.8,
        },
      }),
    },
  },
  MuiCssBaseline: {
    styleOverrides: (theme) => ({
      body: {
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
        fontFamily: typography.fontFamily,
      },
      '*::-webkit-scrollbar': {
        width: '8px',
      },
    }),
  },
  MuiToggleButton: {
    styleOverrides: {
      root: ({ theme }) => ({
        fontFamily: typography.fontFamily,
        fontWeight: typography.button?.fontWeight,
        fontSize: typography.button?.fontSize,
        border: 'none',
        borderRadius: '50px',
        padding: '10px 18px',
        color: theme.palette.text.secondary,
        backgroundColor: theme.palette.background.paper,
        textTransform: 'none',
        position: 'relative',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          color: theme.palette.primary.main,
          boxShadow: `0px 0px 3px 0px ${theme.palette.primary.main}`,
        },
        '&.Mui-selected': {
          boxShadow: `0px 0px 3px 0px ${theme.palette.primary.main}`,
          color: theme.palette.primary.main,
          '&:hover': {
            color: theme.palette.primary.main,
          },
        },
      }),
    },
  },
  MuiToggleButtonGroup: {
    styleOverrides: {
      root: {
        gap: '16px',
        border: 'none',
        '& .MuiToggleButtonGroup-grouped': {
          border: 'none',
          '&:not(:first-of-type)': {
            borderLeft: 'none',
            borderRadius: '50px',
          },
          '&:first-of-type': {
            borderRadius: '50px',
          },
        },
      },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: ({ theme }) => ({
        backgroundColor: theme.palette.background.default,
        color: theme.palette.text.primary,
      }),
    },
  },
  MuiTableContainer: {
    styleOverrides: {
      root: {
        boxShadow: '0px 0px 6px 0px #38FF9C66',
        borderRadius: '8px',
        overflow: 'hidden',
      },
    },
  },
  MuiTable: {
    styleOverrides: {
      root: {
        borderCollapse: 'separate',
        borderSpacing: 0,
      },
    },
  },
  MuiTableHead: {
    styleOverrides: {
      root: {
        '& .MuiTableCell-head': {
          backgroundColor: '#151515',
          borderBottom: 'none',
          color: '#A3FFD1',
          fontFamily: 'Inter',
          fontWeight: 700,
          fontSize: '14px',
          lineHeight: '20px',
          letterSpacing: '-0.02em',
          verticalAlign: 'middle',
        },
      },
    },
  },
  MuiTableBody: {
    styleOverrides: {
      root: {
        '& .MuiTableRow-root': {
          '&:nth-of-type(odd)': {
            backgroundColor: '#1b1b1b',
          },
          '&:nth-of-type(even)': {
            backgroundColor: '#151515',
          },
          '&:hover': {
            backgroundColor: '#2a2a2a !important',
          },
        },
      },
    },
  },
  MuiTableCell: {
    styleOverrides: {
      root: {
        borderBottom: 'none',
        padding: '12px 16px',
      },
      head: {
        fontWeight: 700,
        borderBottom: 'none',
      },
      body: {
        color: '#A3FFD1',
        '&.baker-cell': {
          color: '#38FF9C',
          textDecoration: 'underline',
          cursor: 'pointer',
          '&:hover': {
            opacity: 0.8,
          },
        },
        '&.proposal-cell': {
          fontFamily: 'monospace',
          fontSize: '0.75rem',
          color: '#38FF9C',
          textDecoration: 'underline',
          maxWidth: '200px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          cursor: 'pointer',
          '&:hover': {
            opacity: 0.8,
          },
        },
        '&.time-cell': {
          color: '#A3FFD1',
        },
        '&.voting-power-cell': {
          color: '#A3FFD1',
        },
      },
    },
  },
};