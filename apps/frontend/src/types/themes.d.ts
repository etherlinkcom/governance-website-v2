import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface Palette {
    custom: {
      background?: {
        dropdown?: string;
      }
      tableBg: {
        odd: string;
        even: string;
        hover: string;
      };
    };
  }

  interface PaletteOptions {
    custom?: {
      background?: {
        dropdown?: string;
      }
      tableBg?: {
        odd?: string;
        even?: string;
        hover?: string;
      };
    };
  }

  interface TypographyVariants {
    link: React.CSSProperties;
  }

  interface TypographyVariantsOptions {
    link?: React.CSSProperties;
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    link: true;
  }
}