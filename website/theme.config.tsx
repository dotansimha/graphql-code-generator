/* eslint sort-keys: error */
import {
  CodeGeneratorLogo,
  FooterExtended,
  Navbar,
  Header,
  mdxComponents,
  DocsThemeConfig,
} from '@theguild/components';

const SITE_NAME = 'GraphQL Code Generator';

const config: DocsThemeConfig = {
  components: mdxComponents,
  docsRepositoryBase: 'https://github.com/dotansimha/graphql-code-generator/tree/master/website', // base URL for the docs repository
  editLink: {
    text: 'Edit this page on GitHub',
  },
  feedback: {
    content: 'Question? Give us feedback →',
    labels: 'kind/docs',
  },
  footer: {
    component: <FooterExtended />,
  },
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
  navbar: props => (
    <>
      <Header accentColor="#0070f3" themeSwitch searchBarProps={{ version: 'v2' }} />
      <Navbar {...props} />
    </>
  ),
  project: {
    link: 'https://github.com/dotansimha/graphql-code-generator', // GitHub link in the navbar
  },
  search: {
    component: null,
  },
  sidebar: {
    defaultMenuCollapsed: true,
  },
  titleSuffix: ` – ${SITE_NAME}`,
};

export default config;
