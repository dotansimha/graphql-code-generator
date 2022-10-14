/* eslint sort-keys: error */
import { CodeGeneratorLogo, defineConfig } from '@theguild/components';

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
  titleSuffix: ` – ${SITE_NAME}`,
});
