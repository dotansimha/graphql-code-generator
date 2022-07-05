import type { FC } from 'react';
import type { AppProps } from 'next/app';
import dynamic from 'next/dynamic';

import { appWithTranslation } from 'next-i18next';
import { extendTheme, theme as chakraTheme } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';
import {
  ExtendComponents,
  handlePushRoute,
  CombinedThemeProvider,
  DocsPage,
  AppSeoProps,
  useGoogleAnalytics,
} from '@guild-docs/client';
import { Header, Subheader, FooterExtended } from '@theguild/components';
import 'remark-admonitions/styles/classic.css';
import '../../public/style.css';
import Script from 'next/script';
import React from 'react';
import { Provider as MDXTabsCurrentTabContextProvider } from 'components/MDXTabsCurrentTabContext';
import { MDXWarning } from 'components/MDXWarning';

import '@algolia/autocomplete-theme-classic';
import '@theguild/components/dist/static/css/SearchBarV2.css';

const MDXTabs = dynamic(() => import('components/MDXTabs/MDXTabs'));
const MDXTab = dynamic(() => import('components/MDXTabs/MDXTab'));

ExtendComponents({
  HelloWorld() {
    return <p>Hello World!</p>;
  },
  MDXTabs,
  MDXTab,
  MDXWarning,
});

const styles: typeof chakraTheme['styles'] = {
  global: props => ({
    body: {
      bg: mode('white', 'gray.850')(props),
    },
  }),
};

const accentColor = '#0070f3';

const theme = extendTheme({
  colors: {
    gray: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#5c3a3a',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      850: '#1b1b1b',
      900: '#171717',
    },
  },
  accentColor,
  fonts: {
    heading: 'TGCFont, sans-serif',
    body: 'TGCFont, sans-serif',
  },
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  styles,
});

const serializedMdx = process.env.SERIALIZED_MDX_ROUTES;
const mdxRoutes = { data: serializedMdx && JSON.parse(serializedMdx) };

function AppContent(appProps: AppProps) {
  const { Component, pageProps, router } = appProps;
  const isDocs = router.asPath.startsWith('/docs');
  const analytics = useGoogleAnalytics({ router, trackingId: 'G-0SE4YQR4K3' });

  return (
    <>
      <Script src="https://the-guild.dev/static/crisp.js" />
      <Script {...analytics.loadScriptProps} />
      <Script {...analytics.configScriptProps} />
      <Header accentColor={accentColor} activeLink="/open-source" themeSwitch searchBarProps={{ version: 'v2' }} />
      <Subheader
        activeLink={router.asPath}
        product={{
          title: 'GraphQL Code Generator',
          description: 'Generate anything from GraphQL schema / operations!',
          image: {
            src: '/assets/subheader-logo.svg',
            alt: 'Docs',
          },
          onClick: e => handlePushRoute('/', e),
        }}
        links={[
          {
            children: 'Home',
            title: 'The Guild GraphQL Code Generator',
            href: '/',
            onClick: e => handlePushRoute('/', e),
          },
          {
            children: 'Docs & API',
            href: '/docs/getting-started',
            title: 'Read more about GraphQL Code Generator',
            onClick: e => handlePushRoute('/docs/getting-started', e),
          },
          {
            children: 'Plugin Hub',
            href: '/plugins',
            title: 'Browse the plugin hub',
            onClick: e => handlePushRoute('/plugins', e),
          },
          {
            children: 'GitHub',
            href: 'https://github.com/dotansimha/graphql-code-generator',
            target: '_blank',
            rel: 'noopener norefereer',
            title: "Head to the project's GitHub",
          },
        ]}
        cta={{
          children: 'Contact Us',
          title: 'Start using The Guild Docs',
          href: 'https://the-guild.dev/contact',
          target: '_blank',
          rel: 'noopener noreferrer',
        }}
      />
      {isDocs ? (
        <MDXTabsCurrentTabContextProvider>
          <DocsPage
            appProps={appProps}
            accentColor={accentColor}
            mdxRoutes={mdxRoutes}
            mdxNavigationProps={{
              summaryLabelProps() {
                return {
                  textTransform: 'none',
                };
              },
              linkProps() {
                return {
                  textTransform: 'none',
                };
              },
            }}
          />
        </MDXTabsCurrentTabContextProvider>
      ) : (
        <Component {...pageProps} />
      )}
      <FooterExtended />
    </>
  );
}

const AppContentWrapper = appWithTranslation(function TranslatedApp(appProps) {
  return <AppContent {...appProps} />;
});

const defaultSeo: AppSeoProps = {
  title: 'GraphQL Code Generator',
  description: 'GraphQL Code Generator',
  logo: {
    url: 'https://graphql-code-generator.vercel.app/assets/subheader-logo.svg',
    width: 50,
    height: 54,
  },
};

const App: FC<AppProps> = appProps => {
  return (
    <CombinedThemeProvider theme={theme} accentColor={accentColor} defaultSeo={defaultSeo}>
      <AppContentWrapper {...appProps} />
    </CombinedThemeProvider>
  );
};

export default App;
