/* eslint-disable react-hooks/rules-of-hooks */
/* eslint sort-keys: error */
import { useRouter } from 'next/router';
import { defineConfig, Giscus, PRODUCTS, useTheme, HiveFooter, cn } from '@theguild/components';
import { NavigationMenu } from './src/components/navigation-menu';

import favicon from './public/favicon.svg';

export default defineConfig({
  docsRepositoryBase: 'https://github.com/dotansimha/graphql-code-generator/tree/master/website',
  main({ children }) {
    const { resolvedTheme } = useTheme();
    const { route } = useRouter();

    const comments = route !== '/' && (
      <Giscus
        // ensure giscus is reloaded when client side route is changed
        key={route}
        repo="dotansimha/graphql-code-generator"
        repoId="MDEwOlJlcG9zaXRvcnk3NTY1Nzc5MA=="
        category="Docs Discussions"
        categoryId="DIC_kwDOBIJyPs4CSDSK"
        mapping="pathname"
        theme={resolvedTheme}
      />
    );
    return (
      <>
        {children}
        {comments}
      </>
    );
  },
  websiteName: 'GraphQL-Codegen',
  description: 'Generate anything from GraphQL schema & operations',
  logo: PRODUCTS.CODEGEN.logo({ className: 'w-8' }),
  color: {
    hue: {
      dark: 67.1,
      light: 173,
    },
    saturation: {
      dark: 100,
      light: 40,
    },
  },
  navbar: { component: NavigationMenu },
  footer: {
    component: _props => {
      const { route } = useRouter();

      return (
        <HiveFooter
          className={cn(route === '/' ? 'light' : '[&>:first-child]:mx-0 [&>:first-child]:max-w-[90rem]', 'pt-[72px]')}
          resources={[
            {
              children: 'Privacy Policy',
              href: 'https://the-guild.dev/graphql/hive/privacy-policy.pdf',
              title: 'Privacy Policy',
            },
            {
              children: 'Terms of Use',
              href: 'https://the-guild.dev/graphql/hive/terms-of-use.pdf',
              title: 'Terms of Use',
            },
          ]}
        />
      );
    },
  },
  head: () => {
    return (
      <>
        <link rel="icon" href={favicon.src} />
      </>
    );
  },
});
