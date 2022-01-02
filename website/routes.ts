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
          ['development-workflow', 'Development Workflow'],
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
        ],
      },
      'docs/advanced': {
        $name: 'Advanced Usage',
        $routes: [
          ['programmatic-usage', 'Programmatic Usage'],
          ['lifecycle-hooks', 'Lifecycle Hooks'],
        ],
      },
      'docs/integrations': {
        $name: 'Integrations',
        $routes: [
          ['vscode', 'VSCode Extension'],
          ['prettier', 'Prettier'],
          ['federation', 'Apollo Federation'],
          'apollo-local-state',
          'create-react-app',
          ['gatsby', 'Gatsby'],
        ],
      },
      'docs/custom-codegen': {
        $name: 'Custom Plugins',
        $routes: [
          ['index', 'What are Plugins?'],
          ['write-your-plugin', 'Write Your Plugin'],
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
