import { ReactElement } from 'react';
import Script from 'next/script';
import { AppProps } from 'next/app';
import { useGoogleAnalytics } from 'guild-docs';
import { Header, ThemeProvider, FooterExtended } from '@theguild/components';
import 'guild-docs/style.css'

export default function App({ Component, pageProps, router }: AppProps): ReactElement {
  const analytics = useGoogleAnalytics({ router, trackingId: 'G-0SE4YQR4K3' });
  // @ts-expect-error -- getLayout is custom function from nextra
  const { getLayout = page => page } = Component

  return (
    <ThemeProvider attribute="class">
      <Script src="https://the-guild.dev/static/crisp.js" />
      <Script {...analytics.loadScriptProps} />
      <Script {...analytics.configScriptProps} />
      <Header accentColor="#0070f3" themeSwitch searchBarProps={{ version: 'v2' }} />
      {getLayout(<Component {...pageProps} />)}
      <FooterExtended />
    </ThemeProvider>
  );
}
