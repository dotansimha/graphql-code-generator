import { IRoutes, GenerateRoutes } from '@guild-docs/server';
export function getRoutes(): IRoutes {
  const Routes: IRoutes = {
    _: {
      docs: {
        $name: 'Docs',
        $routes: ['README', 'getting-started', 'integrations', 'core', 'composing-envelop'],
        _: {
          plugins: {
            $name: 'Plugins',
            $routes: ['README', 'custom-plugin', 'lifecycle', 'testing'],
          },
          guides: {
            $name: 'Guides',
            $routes: [
              'securing-your-graphql-api',
              'adding-authentication-with-auth0',
              'monitoring-and-tracing',
              'using-graphql-features-from-the-future',
              'resolving-subscription-data-loader-caching-issues',
              'adding-a-graphql-response-cache',
            ],
          },
        },
      },
    },
  };

  GenerateRoutes({
    Routes,
    folderPattern: 'docs',
    basePath: 'docs',
    basePathLabel: 'Documentation',
    labels: {},
  });

  return Routes;
}
