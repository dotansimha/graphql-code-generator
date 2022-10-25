/* eslint-disable react-hooks/rules-of-hooks */
/* eslint sort-keys: error */
import { CodeGeneratorLogo, defineConfig, Giscus, useTheme } from '@theguild/components';
import { useRouter } from 'next/router';

const SITE_NAME = 'GraphQL Code Generator';

export default defineConfig({
  docsRepositoryBase: 'https://github.com/dotansimha/graphql-code-generator/tree/master/website', // base URL for the docs repository
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="description" content={`${SITE_NAME}: documentation`} />
      <meta name="og:title" content={`${SITE_NAME}: documentation`} />
    </>
  ),
  logo: (
    <>
      <CodeGeneratorLogo className="mr-1.5 h-9 w-9" />
      <div>
        <h1 className="md:text-md text-sm font-medium">{SITE_NAME}</h1>
        <h2 className="hidden text-xs sm:block">Generate anything from GraphQL schema / operations</h2>
      </div>
    </>
  ),
  main: {
    extraContent() {
      const { resolvedTheme } = useTheme();
      const { route } = useRouter();

      if (route === '/') {
        return null;
      }
      return (
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
    },
  },
  titleSuffix: ` – ${SITE_NAME}`,
});
