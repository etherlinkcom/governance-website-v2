import { PaletteOptions } from "@mui/material";

export const palette: PaletteOptions = {
  mode: 'dark',
  primary: {
    main: '#38FF9C',
    light: '#33E88E',
    dark: '#28B56F',
    contrastText: '#000000',
  },
  secondary: {
    main: '#FF6B6B',
    light: '#FF9999',
    dark: '#E55555',
    contrastText: '#BCBCBC',
  },
  background: {
    default: '#0A0A0A',
    paper: '#151515',
  },
  text: {
    primary: '#e9e9e9',
    secondary: '#888888',
    disabled: '#999999'
  },
  info: {
    main: '#A3FFD1',
    light: '#CCFFE8',
    dark: '#7AFFCA',
    contrastText: '#000000',
  },
  warning: {
    main: '#FFA726',
    light: '#FFD54F',
    dark: '#F57C00',
    contrastText: '#9b9b9b',
  },
  error: {
    main: '#FF6B6B',
    light: '#FF9999',
    dark: '#E55555',
    contrastText: '#b5b5b5',
  },
  success: {
    main: '#38FF9C',
    light: '#A3FFD1',
    dark: '#2ECC7F',
    contrastText: '#000000',
  },
  divider: 'rgba(56, 255, 156, 0.4)',
  custom: {
    background: {
      dropdown: "#101010"
    },
    tableBg: {
      odd: '#1b1b1b',
      even: '#151515',
      hover: '#2a2a2a',
    },
  },
};

