import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Toaster } from 'react-hot-toast';
import { theme } from '@/theme';
import { Layout } from "@/components/layouts/Layout";
import { toastConfig } from '@/theme/toastConfig';
import { PostHogProvider } from 'posthog-js/react'
import posthog from 'posthog-js'
import { useEffect } from 'react'


export default function App({ Component, pageProps }: AppProps) {

  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
      defaults: '2025-05-24',
    })
  }, [])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Layout>
        <PostHogProvider client={posthog}>
          <Component {...pageProps} />
        </PostHogProvider>
      </Layout>
      <Toaster {...toastConfig} />
    </ThemeProvider>
  );
}