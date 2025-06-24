// pages/_app.tsx
import type { AppProps } from 'next/app';
import { TezosProvider } from '@nlfr/use-tezos';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <TezosProvider config={{
      dappName: 'Governance V2',
      rpcUrl: "https://ghostnet.ecadinfra.com",
      network: 'GHOSTNET',
      iconUrl: ''
    }}
    >
      <Component {...pageProps} />
    </TezosProvider>
  );
}
