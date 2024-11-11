/* eslint-disable react-hooks/rules-of-hooks */
/* eslint sort-keys: error */
import { useRouter } from 'next/router';
import {
  defineConfig,
  Giscus,
  PRODUCTS,
  useTheme,
  HiveFooter,
  cn,
  HiveNavigation,
  Anchor,
  CodegenIcon,
  GitHubIcon,
  PaperIcon,
  PencilIcon,
} from '@theguild/components';

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
  navbar: {
    component: function NavigationMenu() {
      const { route } = useRouter();

      return (
        <HiveNavigation
          className={route === '/' ? 'light max-w-[1392px]' : 'max-w-[90rem]'}
          productName={PRODUCTS.CODEGEN.name}
          navLinks={[{ href: '/plugins', children: 'Plugins' }]}
          developerMenu={[
            {
              href: '/docs',
              icon: PaperIcon,
              children: 'Documentation',
            },
            {
              href: 'https://the-guild.dev/blog',
              icon: PencilIcon,
              children: 'Blog',
            },
            {
              href: 'https://github.com/dotansimha/graphql-code-generator',
              icon: GitHubIcon,
              children: 'GitHub',
            },
          ]}
          logo={
            <Anchor href="/" className="hive-focus -m-2 flex items-center gap-3 rounded-md p-2">
              <CodegenIcon className="size-8" />
              <span className="text-2xl font-medium tracking-[-0.16px]">Codegen</span>
            </Anchor>
          }
        />
      );
    },
  },
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
          description="End-to-end type safety"
          logo={{
            href: '/',
            children: (
              <div className="flex items-center gap-3 text-green-1000">
                <CodegenIcon className="size-8" />
                <span className="text-2xl/[1.2] font-medium tracking-[-0.16px]">Codegen</span>
              </div>
            ),
          }}
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
