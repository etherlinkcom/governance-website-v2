import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    custom: {
      tableBg: {
        odd: string;
        even: string;
        hover: string;
      };
      border: {
        primary: string;
        secondary: string;
      };
      shadow: {
        primary: string;
        secondary: string;
      };
    };
  }

  interface PaletteOptions {
    custom?: {
      tableBg?: {
        odd?: string;
        even?: string;
        hover?: string;
      };
      border?: {
        primary?: string;
        secondary?: string;
      };
      shadow?: {
        primary?: string;
        secondary?: string;
      };
    };
  }

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