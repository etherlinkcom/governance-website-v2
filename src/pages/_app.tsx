import type { AppProps } from 'next/app';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { createContext } from 'react';
import Head from 'next/head';
import theme from '../theme';

export const StoreContext = createContext({});

const MyApp = observer(({ Component, pageProps }: AppProps) => {
  return (
    <StoreContext.Provider value={{}}>
      <Head>
        <title>Governance V2</title>
        <meta name="viewport" content="initial-scale=1, width=device-width" />
      </Head>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Component {...pageProps} />
      </ThemeProvider>
    </StoreContext.Provider>
  );
});

export default MyApp;
