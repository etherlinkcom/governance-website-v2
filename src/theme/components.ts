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
        '&.MuiTypography-h1, &.MuiTypography-h2, &.MuiTypography-h3, &.MuiTypography-h4, &.MuiTypography-h5, &.MuiTypography-h6': {
          color: theme.palette.text.primary,
        },
        '&.MuiTypography-link': {
          color: theme.palette.primary.main,
          '&:hover': {
            color: theme.palette.primary.dark,
            textDecorationThickness: '2px',
            cursor: 'pointer',
          },
        },
        '&.MuiTypography-body1': {
          color: theme.palette.text.primary,
        },
        '&.MuiTypography-body2': {
          color: theme.palette.primary.main,
        },
          '&.MuiTypography-subtitle1, &.MuiTypography-subtitle2': {
          color: theme.palette.text.secondary,
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
      root: ({ theme }) => ({
        boxShadow: `0px 0px 6px 0px ${theme.palette.custom.shadow.primary}`,
        borderRadius: '25px',
        overflow: 'hidden',
      }),
    },
  },
  MuiTable: {
    styleOverrides: {
      root: {
        borderCollapse: 'separate',
        borderSpacing: 0,
        padding: '12px'
      },
    },
  },
  MuiTableHead: {
    styleOverrides: {
      root: ({ theme }) => ({
        '& .MuiTableCell-head': {
          backgroundColor: theme.palette.background.paper,
          borderBottom: 'none',
          color: theme.palette.info.main,
          fontWeight: 700,
          fontSize: '16px',
          lineHeight: '20px',
          letterSpacing: '-0.02em',
          verticalAlign: 'middle',
        },
      }),
    },
  },
  MuiTableBody: {
    styleOverrides: {
      root: ({ theme }) => ({
        '& .MuiTableRow-root': {
          '&:nth-of-type(odd)': {
            backgroundColor: theme.palette.custom.tableBg.odd,
          },
          '&:nth-of-type(even)': {
            backgroundColor: theme.palette.custom.tableBg.even,
          },
          '&:hover': {
            backgroundColor: `${theme.palette.custom.tableBg.hover} !important`,
          },
        },
      }),
    },
  },
  MuiTableCell: {
    styleOverrides: {
      root: {
        borderBottom: 'none',
        padding: '12px 16px',
      },
      body: ({ theme }) => ({
        color: theme.palette.info.main,
        fontWeight: 400,
        fontSize: '14px',
        lineHeight: '18px',
        letterSpacing: '-0.02em',
        verticalAlign: 'middle',
      }),
    },
  },
  MuiAccordion: {
    styleOverrides: {
      root: ({ theme }) => ({
        width: '100%',
        boxShadow: `0px 0px 6px 0px ${theme.palette.custom.shadow.primary}`,
        borderRadius: theme.shape.borderRadius,
        border: 'none',
        '&:before': {
          display: 'none',
        },
      }),
    },
  },
  MuiAccordionSummary: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: `${theme.shape.borderRadius} 10px 0 0`,
        padding: theme.spacing(1, 2),
        '& .MuiAccordionSummary-content': {
          margin: theme.spacing(1.5, 0),
        },
        '& .MuiAccordionSummary-expandIconWrapper': {
          color: theme.palette.primary.main,
        },
      }),
    },
  },
  MuiAccordionDetails: {
    styleOverrides: {
      root: ({ theme }) => ({
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing(4),
      }),
    },
  },
  MuiMenuItem: {
    styleOverrides: {
      root: ({ theme }) => ({
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          backgroundColor: alpha(theme.palette.primary.main, 0.1),
        },
      }),
    },
  },
};