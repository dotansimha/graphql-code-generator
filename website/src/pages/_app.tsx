import { ReactElement } from 'react';
import { useGoogleAnalytics } from '@guild-docs/client';
import { Header, FooterExtended } from '@theguild/components';
import 'remark-admonitions/styles/classic.css';
import Script from 'next/script';
import { AppProps } from 'next/app';

import '@algolia/autocomplete-theme-classic';
import '@theguild/components/dist/static/css/SearchBarV2.css';
import 'nextra-theme-docs/style.css';
import '../../public/style.css';

const accentColor = '#0070f3';

export default function App({ Component, pageProps, router }: AppProps): ReactElement {
  const analytics = useGoogleAnalytics({ router, trackingId: 'G-0SE4YQR4K3' });
  const { getLayout } = Component;
  const childComponent = <Component {...pageProps} />

  return (
    <>
      <Script src="https://the-guild.dev/static/crisp.js" />
      <Script {...analytics.loadScriptProps} />
      <Script {...analytics.configScriptProps} />
      <Header accentColor={accentColor} activeLink="/open-source" themeSwitch searchBarProps={{ version: 'v2' }} />
      {getLayout ? getLayout(childComponent) : childComponent}
      <FooterExtended />
    </>
  );
}
