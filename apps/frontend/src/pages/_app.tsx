import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'react-hot-toast';
import { theme } from '@/theme';
import { Layout } from "@/components/layouts/Layout";
import { toastConfig } from '@/theme/toastConfig';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Layout>
        <Component {...pageProps} />
      </Layout>
      <Toaster {...toastConfig} />
    </ThemeProvider>
  );
}