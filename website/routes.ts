import type { IRoutes } from '@guild-docs/server';
import { GenerateRoutes } from '@guild-docs/server';

export function getRoutes(): IRoutes {
  const Routes: IRoutes = {
    _: {
      docs: {
        $name: 'Docs',
        _: {
          'getting-started': {
            $name: 'Getting Started',
            $routes: [
              'index',
              'installation',
              'development-workflow',
              '$config-reference',
              'programmatic-usage',
              'further-reading',
            ],
            _: {
              'config-reference': {
                $name: 'Config Reference',
                $routes: [
                  'codegen-config',
                  'schema-field',
                  'documents-field',
                  'config-field',
                  'require-field',
                  'naming-convention',
                  'lifecycle-hooks',
                ],
              },
            },
          },
          integrations: {
            $name: 'Integrations',
            $routes: ['apollo-local-state', 'create-react-app', 'gatsby', 'prettier', 'federation', 'vscode'],
          },
          'custom-codegen': {
            $name: 'Custom Plugins',
            $routes: [
              'index',
              'write-your-plugin',
              'validate-configuration',
              'extend-schema',
              'using-visitor',
              'contributing',
            ],
          },
          migration: {
            $name: 'Migration Guide',
            $routes: ['from-0-18', 'from-0-13'],
          },
        },
      },
    },
  };

  GenerateRoutes({
    Routes,
    folderPattern: 'docs',
    basePath: 'docs',
  });

  return Routes;
}
