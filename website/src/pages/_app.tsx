import type { FC } from 'react';
import type { AppProps } from 'next/app';
import { appWithTranslation } from 'next-i18next';
import { extendTheme, theme as chakraTheme } from '@chakra-ui/react';
import { mode } from '@chakra-ui/theme-tools';
import { ExtendComponents, handlePushRoute, CombinedThemeProvider, DocsPage, AppSeoProps } from '@guild-docs/client';
import { Header, Subheader, FooterExtended } from '@theguild/components';
import 'remark-admonitions/styles/classic.css';
import '../../public/style.css';

ExtendComponents({
  HelloWorld() {
    return <p>Hello World!</p>;
  },
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

  return (
    <>
      <Header accentColor={accentColor} activeLink="/open-source" themeSwitch />
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
