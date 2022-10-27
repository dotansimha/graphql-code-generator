/* eslint-disable react-hooks/rules-of-hooks */
/* eslint sort-keys: error */
import { CodeGeneratorLogo, defineConfig, Giscus, useTheme } from '@theguild/components';
import { useRouter } from 'next/router';

const siteName = 'GraphQL Code Generator';

export default defineConfig({
  docsRepositoryBase: 'https://github.com/dotansimha/graphql-code-generator/tree/master/website', // base URL for the docs repository
  logo: (
    <>
      <CodeGeneratorLogo className="mr-1.5 h-9 w-9" />
      <div>
        <h1 className="md:text-md text-sm font-medium">{siteName}</h1>
        <h2 className="hidden text-xs sm:block">Generate anything from GraphQL schema / operations</h2>
      </div>
    </>
  ),
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
  siteName,
});
