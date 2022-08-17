import { CodeGeneratorLogo } from '@theguild/components';

const SITE_NAME = 'GraphQL Code Generator';

export default {
  titleSuffix: ` – ${SITE_NAME}`,
  projectLink: 'https://github.com/dotansimha/graphql-code-generator', // GitHub link in the navbar
  github: null,
  docsRepositoryBase: 'https://github.com/dotansimha/graphql-code-generator/tree/master/website/src/pages', // base URL for the docs repository
  nextLinks: true,
  prevLinks: true,
  search: null,
  unstable_flexsearch: null,
  floatTOC: true,
  customSearch: null, // customizable, you can use algolia for example
  darkMode: true,
  footer: null,
  footerEditLink: 'Edit this page on GitHub',
  logo: (
    <>
      <CodeGeneratorLogo className="mr-1.5 h-9 w-9" />
      <div>
        <h1 className="md:text-md text-sm font-medium">{SITE_NAME}</h1>
        <h2 className="hidden text-xs sm:!block">Generate anything from GraphQL schema / operations</h2>
      </div>
    </>
  ),
  // bannerKey: "new-website-banner",
  // banner: `New ${SITE_NAME} website is out! Read more →`,
  head: (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="description" content={`${SITE_NAME}: documentation`} />
      <meta name="og:title" content={`${SITE_NAME}: documentation`} />
    </>
  ),
  gitTimestamp: 'Last updated on',
  defaultMenuCollapsed: true,
  feedbackLink: 'Question? Give us feedback →',
  feedbackLabels: 'kind/docs',
};
