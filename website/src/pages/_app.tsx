import { ReactElement } from 'react';
import { AppProps } from 'next/app';
import '@theguild/components/style.css';
import '../lib/search-bar.css';

export default function App({ Component, pageProps }: AppProps): ReactElement {
  return <Component {...pageProps} />;
}
