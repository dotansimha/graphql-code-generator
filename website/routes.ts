import type { IRoutes } from '@guild-docs/server';
import { GenerateRoutes } from '@guild-docs/server';

export function getRoutes(): IRoutes {
  const Routes: IRoutes = {
    _: {
      'docs/getting-started': {
        $name: 'Getting Started',
        $routes: [
          ['index', 'Introduction'],
          ['installation', 'Installation'],
          ['development-workflow', 'Development workflow'],
        ],
      },
      'docs/guides': {
        $name: 'Guides',
        $routes: [
          ['react', 'React'],
          ['vue', 'Vue.js'],
          ['angular', 'Angular'],
          ['svelte', 'Svelte / Kit'],
          ['front-end-typescript-only', 'TypeScript only (front-end)'],
          ['graphql-server-apollo-yoga', 'Apollo Server / GraphQL Yoga'],
          ['graphql-modules', 'GraphQL Modules'],
          ['further-reading', 'Further Reading'],
        ],
      },
      'docs/config-reference': {
        $name: 'Config Reference',
        $routes: [
          ['codegen-config', 'codegen.yml'],
          ['schema-field', 'schema field'],
          ['documents-field', 'documents field'],
          ['config-field', 'plugin config'],
          ['require-field', 'require field'],
          ['naming-convention', 'Naming Convention'],
          ['lifecycle-hooks', 'Lifecycle Hooks'],
          ['multiproject-config', 'Multi Project'],
        ],
      },
      'docs/advanced': {
        $name: 'Advanced Usage',
        $routes: [
          ['generated-files-colocation', 'Generated files colocation'],
          ['programmatic-usage', 'Programmatic Usage'],
          ['how-does-it-work', 'How does it work?'],
          ['profiler', 'Profiler'],
        ],
      },
      'docs/integrations': {
        $name: 'Integrations',
        $routes: [
          ['vscode', 'VSCode Extension'],
          ['prettier', 'Prettier'],
          ['federation', 'Apollo Federation'],
          ['apollo-local-state', 'apollo-local-state'],
          ['create-react-app', 'create-react-app'],
          ['gatsby', 'Gatsby'],
        ],
      },
      'docs/custom-codegen': {
        $name: 'Writing Plugins',
        $routes: [
          ['index', 'What are Plugins?'],
          ['plugin-structure', 'Plugin structure'],
          ['validate-configuration', 'Validate Configuration'],
          ['extend-schema', 'Extend Schema'],
          ['using-visitor', 'Using Visitor Pattern'],
          ['contributing', 'Contributing'],
        ],
      },
      'docs/migration': {
        $name: 'Migration Guides',
        $routes: [
          ['from-0-18', 'v0.18 -> v1.0'],
          ['from-0-13', 'v0.13 -> v0.17'],
        ],
      },
    },
  };

  GenerateRoutes({
    Routes,
  });

  return Routes;
}
