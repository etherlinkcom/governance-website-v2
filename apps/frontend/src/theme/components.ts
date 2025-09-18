import { Components, Theme, alpha } from "@mui/material/styles";
import { typography } from "./typography";

export const components: Components<Theme> = {
  MuiButton: {
    styleOverrides: {
      root: ({ theme }) => ({
        fontFamily: typography.fontFamily,
        fontWeight: typography.button?.fontWeight,
        fontSize: typography.button?.fontSize,
        lineHeight: typography.button?.lineHeight,
        letterSpacing: typography.button?.letterSpacing,
        verticalAlign: "middle",
        textTransform: "none",
        borderRadius: "50px",
        padding: "12px 24px",
        transition: "all 0.2s ease-in-out",
        gap: theme.spacing(1),
        textAlign: "center",
        whiteSpace: "normal",
        wordWrap: "break-word",
        height: 45
      }),
      contained: ({ theme }) => ({
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.primary.contrastText,
        boxShadow: `0px 0px 3px 0px ${theme.palette.primary.main}`,
        "&:hover": {
          backgroundColor: theme.palette.primary.main,
          boxShadow: `0px 0px 8px 2px ${theme.palette.primary.main}`,
          transform: "translateY(-1px)",
        },
      }),
      outlined: ({ theme }) => ({
        backgroundColor: theme.palette.custom.tableBg.odd,
        color: theme.palette.primary.main,
        boxShadow: `0px 0px 6px 0px ${alpha(theme.palette.primary.dark, 0.4)}`,
        "&:hover": {
          backgroundColor: alpha(theme.palette.primary.main, 0.1),
          transform: "translateY(-1px)",
        },
        "&.home-page-button":{
          paddingTop: '13px',
          paddingBottom: '13px',
          color: theme.palette.primary.main,
          fontSize: 16,
          boxShadow: `0px 0px 6px 0px ${alpha(theme.palette.primary.dark, 0.4)}`,
          fontWeight: 600,
          border: 'none',
        }
      }),
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: ({ theme }) => ({
        backgroundColor: theme.palette.background.paper,
        backgroundImage: "none",
        border: "2px solid transparent",
        borderRadius: 12,
        "&.table-card": {
          padding: theme.spacing(2),
          marginTop: theme.spacing(2),
          marginBottom: theme.spacing(2),
          borderRadius: theme.shape.borderRadius,
          boxShadow: `0px 0px 3px 0px ${theme.palette.primary.main}`,
        },
      }),
    },
  },
  MuiCard: {
    styleOverrides: {
      root: ({ theme }) => ({
        backgroundColor: theme.palette.background.paper,
        boxShadow: `0px 0px 6px 0px ${theme.palette.divider}`,
        border: "none",
        borderRadius: "25px",
        "&.past-card": {
          "&:hover": {
            boxShadow: `0px 0px 10px 2px ${theme.palette.divider}`,
            transform: "translateY(-2px)",
            transition: "all 0.2s ease-in-out",
          },
        },
      }),
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: ({ theme }) => ({
        "& .MuiOutlinedInput-root": {
          backgroundColor: alpha(theme.palette.background.default, 0.8),
          fontFamily: typography.fontFamily,
          fontSize: typography.body1?.fontSize,
          fontWeight: typography.body1?.fontWeight,
          "& fieldset": {
            borderColor: alpha(theme.palette.primary.main, 0.3),
          },
          "&:hover fieldset": {
            borderColor: theme.palette.primary.main,
          },
          "&.Mui-focused fieldset": {
            borderColor: theme.palette.primary.main,
            boxShadow: `0px 0px 3px 0px ${theme.palette.primary.main}`,
          },
        },
        "& .MuiInputLabel-root": {
          color: theme.palette.text.secondary,
          fontFamily: typography.fontFamily,
          "&.Mui-focused": {
            color: theme.palette.primary.main,
          },
        },
        "& .MuiOutlinedInput-input": {
          color: theme.palette.text.primary,
        },
      }),
    },
  },
  MuiDialog: {
    styleOverrides: {
      root: ({ theme }) => ({
        "& .MuiBackdrop-root": {
          backgroundColor: alpha(theme.palette.background.paper, 0.8),
        },
      }),
      paper: ({ theme }) => ({
        backgroundColor: theme.palette.background.paper,
        backdropFilter: "blur(12px)",
        boxShadow: `0px 0px 6px 0px ${theme.palette.divider}`,
        borderRadius: "25px",
        border: "none",
        minWidth: "95vw",
        margin: "8px",
        [theme.breakpoints.up("sm")]: {
          minWidth: "500px",
          margin: "24px",
        },
      }),
    },
  },
  MuiModal: {
    styleOverrides: {
      root: ({ theme }) => ({
        "& .modal-content": {
          position: "absolute",
          inset: 0,
          margin: "auto",
          width: "100vw",
          height: "100dvh",
          backgroundColor: theme.palette.background.paper,
          borderRadius: theme.spacing(1),
          boxShadow: 24,
          display: "flex",
          flexDirection: "column",
          overflow: "auto",
          [theme.breakpoints.up("lg")]: {
            width: "90vw",
            height: "90dvh",
          },
        },
      }),
    },
  },
  MuiTabs: {
    styleOverrides: {
      root: {
        "& .MuiTabs-indicator": {
          backgroundColor: "primary.main",
        },
      },
    },
  },
  MuiTab: {
    styleOverrides: {
      root: {
        textTransform: "none",
        fontSize: "1rem",
        fontWeight: 400,
        "&.Mui-selected": {
          fontWeight: 600,
        },
      },
    },
  },
  MuiLink: {
    styleOverrides: {
      root: ({ theme }) => ({
        "&.contract-link": {
          textDecorationColor: theme.palette.primary.main,
          overflow: "hidden !important",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          maxWidth: "100%",
          display: "block",
          "&:hover": {
            textDecorationColor: theme.palette.primary.light,
          },
        },
        "&.proposal-link": {
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
          maxWidth: "100%",
          display: "inline-block",
          "&:hover": {
            textDecorationColor: theme.palette.primary.light,
          },
        },
      }),
    },
  },
  MuiTypography: {
    styleOverrides: {
      root: ({ theme }) => ({
        fontFamily: typography.fontFamily,
        overflow: "inherit",
        textOverflow: "inherit",
        whiteSpace: "inherit",
        "&.MuiTypography-h1, &.MuiTypography-h2, &.MuiTypography-h3, &.MuiTypography-h4, &.MuiTypography-h5, &.MuiTypography-h6":
          {
            color: theme.palette.text.primary,
          },
        "&.MuiTypography-body1": {
          color: theme.palette.text.primary,
        },
        "&.MuiTypography-body2": {
          color: theme.palette.primary.main,
        },
        "&.MuiTypography-subtitle1, &.MuiTypography-subtitle2": {
          color: theme.palette.text.secondary,
        },
        "&.mobile-menu-item": {
          fontWeight: 700,
          fontSize: "14px",
          color: "#bcbcbc",
          cursor: "pointer",
          height: "40px",
          padding: theme.spacing(1.5, 3),
          borderRadius: "24px",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            color: theme.palette.primary.dark,
            backgroundColor: theme.palette.custom.tableBg.odd,
          },
        },
        "&.mobile-menu-track": {
          fontWeight: 700,
          fontSize: "14px",
          color: "#bcbcbc",
          cursor: "pointer",
          margin: theme.spacing(0.5, 0),
          padding: theme.spacing(1, 4.5),
          borderRadius: "100px",
          border: "0 !important",
          transition: "all 0.2s ease-in-out",
          "&:hover": {
            backgroundColor: theme.palette.custom.tableBg.odd,
            color: theme.palette.primary.dark + " !important",
          },
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
        minWidth: "375px",
        paddingBottom: "40px",
      },
      "*::-webkit-scrollbar": {
        width: "8px",
      },
    }),
  },
  MuiAppBar: {
    styleOverrides: {
      root: () => ({
        backgroundColor: "transparent",
        boxShadow: "none",
      }),
    },
  },
  MuiTableContainer: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: "25px",
        overflow: "auto",
        overflowX: "auto",
        maxHeight: "500px",
        "&::-webkit-scrollbar": {
          height: "8px",
        },
        "&::-webkit-scrollbar-track": {
          backgroundColor: alpha(theme.palette.primary.main, 0.1),
          borderRadius: "4px",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: alpha(theme.palette.primary.main, 0.1),
          borderRadius: "4px",
          "&:hover": {
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
          },
        },
        scrollbarWidth: "thin",
        scrollbarColor: `${alpha(theme.palette.primary.main, 0.1)} ${alpha(
          theme.palette.primary.main,
          0.0
        )}`,
      }),
    },
  },
  MuiTable: {
    styleOverrides: {
      root: {
        borderCollapse: "separate",
        borderSpacing: 0,
      },
    },
  },
  MuiTableHead: {
    styleOverrides: {
      root: ({ theme }) => ({
        "& .MuiTableCell-head": {
          backgroundColor: theme.palette.background.paper,
          borderBottom: "none",
          color: theme.palette.info.main,
          fontWeight: 700,
          fontSize: "16px",
          lineHeight: "20px",
          letterSpacing: "-0.02em",
          verticalAlign: "middle",
        },
      }),
    },
  },
  MuiTableBody: {
    styleOverrides: {
      root: ({ theme }) => ({
        "& .MuiTableRow-root": {
          "&:nth-of-type(odd)": {
            backgroundColor: theme.palette.custom.tableBg.odd,
          },
          "&:nth-of-type(even)": {
            backgroundColor: theme.palette.custom.tableBg.even,
          },
          "&:hover": {
            backgroundColor: `${theme.palette.custom.tableBg.hover} !important`,
          },
        },
      }),
    },
  },
  MuiTableCell: {
    styleOverrides: {
      root: {
        borderBottom: "none",
        padding: "12px 16px",
      },
      body: ({ theme }) => ({
        color: theme.palette.info.main,
        fontWeight: 400,
        fontSize: "14px",
        lineHeight: "18px",
        letterSpacing: "-0.02em",
        verticalAlign: "middle",
      }),
    },
  },
  MuiAccordion: {
    styleOverrides: {
      root: ({ theme }) => ({
        width: "100%",
        borderRadius: theme.shape.borderRadius,
        boxShadow: `0px 0px 3px 0px ${theme.palette.primary.main}`,
        border: "none",
        "&:before": {
          display: "none",
        },
        "&.Mui-expanded": {
          margin: "0",
        },
        "&.mobile-menu-accordion": {
          boxShadow: "none",
          backgroundColor: "transparent",
          borderRadius: "24px",
        },
      }),
    },
  },
  MuiAccordionSummary: {
    styleOverrides: {
      root: ({ theme }) => ({
        borderRadius: theme.shape.borderRadius,
        padding: theme.spacing(1, 2),
        "& .MuiAccordionSummary-content": {
          margin: theme.spacing(1.5, 0),
        },
        "& .MuiAccordionSummary-expandIconWrapper": {
          color: theme.palette.primary.main,
        },
        "&.mobile-menu-summary": {
          padding: theme.spacing(1.5, 3),
          height: "40px",
          minHeight: "40px",
          backgroundColor: "transparent",
          "&.Mui-expanded": {
            backgroundColor: theme.palette.custom.tableBg.odd,
            borderBottomLeftRadius: "0",
            borderBottomRightRadius: "0",
            "& .MuiTypography-root": {
              color: theme.palette.primary.dark + " !important",
            },
            "& .MuiSvgIcon-root": {
              color: theme.palette.primary.dark + " !important",
            },
          },
          "&:hover": {
            backgroundColor: theme.palette.custom.tableBg.odd,
            "& .MuiTypography-root": {
              color: theme.palette.primary.dark + " !important",
            },
            "& .MuiSvgIcon-root": {
              color: theme.palette.primary.dark + " !important",
            },
          },
          "& .MuiAccordionSummary-content": {
            margin: 0,
          },
        },
      }),
    },
  },
  MuiAccordionDetails: {
    styleOverrides: {
      root: ({ theme }) => ({
        display: "flex",
        flexDirection: "column",
        "&.mobile-menu-details": {
          padding: 0,
          backgroundColor: theme.palette.custom.tableBg.even,
          borderBottomLeftRadius: "24px",
          borderBottomRightRadius: "24px",
        },
      }),
    },
  },
  MuiSelect: {
    styleOverrides: {
      root: ({ theme }) => ({
        color: "#bcbcbc",
        padding: 0,
        "&[aria-expanded='true']": {
          color: theme.palette.primary.dark,
        },
        "& .MuiSelect-select": {
          fontWeight: 700,
          padding: 0,
        },
        "& .MuiSvgIcon-root": {
          color: "#bcbcbc",
        },
        "&:hover": {
          color: theme.palette.primary.dark,
          "& .MuiSvgIcon-root": {
            color: theme.palette.primary.dark,
          },
        },
      }),
    },
  },
  MuiMenu: {
    styleOverrides: {
      paper: ({ theme }) => ({
        color: "#bcbcbc",
        background: theme.palette.custom.background?.dropdown,
        marginTop: theme.spacing(2),
        marginLeft: theme.spacing(-1),
        width: 290,
        borderRadius: "24px",
        padding: theme.spacing(0.5),
        border: 0,
        "& .MuiList-root": {
          background: theme.palette.custom.background?.dropdown,
          borderRadius: "24px",
          padding: 0,
          margin: 0,
        },
      }),
    },
  },
  MuiMenuItem: {
    styleOverrides: {
      root: ({ theme }) => ({
        background: theme.palette.custom.background?.dropdown + " !important",
        transition: "all 0.2s ease-in-out",
        borderRadius: "100px",
        fontWeight: 700,
        fontSize: "14px",
        margin: theme.spacing(0.5),
        padding: theme.spacing(1, 3),
        "&:hover": {
          backgroundColor: theme.palette.custom.tableBg.odd + " !important",
          color: theme.palette.primary.main,
        },
      }),
    },
  },
  MuiDrawer: {
    styleOverrides: {
      paper: ({ theme }) => ({
        height: "45vh",
        width: "100vw",
        minWidth: "375px",
        borderTopLeftRadius: "25px",
        borderTopRightRadius: "25px",
        backgroundColor: theme.palette.background.default,
        padding: theme.spacing(3),
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "flex-start",
      }),
      root: {
        "& .MuiBackdrop-root": {
          backdropFilter: "blur(4px)",
          backgroundColor: "rgba(0,0,0,0.4)",
        },
      },
    },
  },
};
