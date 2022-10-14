import { RawClientSideBasePluginConfig } from '@graphql-codegen/visitor-plugin-common';

/**
 * @description This plugin generates Apollo services (`Query`, `Mutation` and `Subscription`) with TypeScript typings.
 *
 * It will generate a strongly typed Angular service for every defined query, mutation or subscription. The generated Angular services are ready to inject and use within your Angular component.
 *
 * It extends the basic TypeScript plugins: `@graphql-codegen/typescript`, `@graphql-codegen/typescript-operations` - and thus shares a similar configuration.
 *
 * To shed some more light regards this template, it's recommended to go through this article: https://apollo-angular.com/docs/get-started, and to read the Code Generation with Apollo Angular: https://the-guild.dev/blog/apollo-angular-12
 */
export interface ApolloAngularRawPluginConfig extends RawClientSideBasePluginConfig {
  /**
   * @description Version of `apollo-angular` package
   * @default 2
   *
   * @exampleMarkdown
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        plugins: ['apollo-angular'],
   *        config: {
   *          apolloAngularVersion: 1
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  apolloAngularVersion?: number;
  /**
   * @description Allows to define `ngModule` as part of the plugin's config so it's globally available.
   *
   * @exampleMarkdown
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        plugins: ['apollo-angular'],
   *        config: {
   *          ngModule: './path/to/module#MyModule'
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  ngModule?: string;
  /**
   * @description Defined the global value of `namedClient`.
   *
   * @exampleMarkdown
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        plugins: ['apollo-angular'],
   *        config: {
   *          namedClient: 'customName'
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  namedClient?: string;
  /**
   * @description Defined the global value of `serviceName`.
   *
   * @exampleMarkdown
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        plugins: ['apollo-angular'],
   *        config: {
   *          serviceName: 'MySDK'
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  serviceName?: string;
  /**
   * @description Defined the global value of `serviceProvidedInRoot`.
   *
   * @exampleMarkdown
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        plugins: ['apollo-angular'],
   *        config: {
   *          serviceProvidedInRoot: false
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  serviceProvidedInRoot?: boolean;
  /**
   * @description Define the Injector of the SDK class.
   *
   * @exampleMarkdown
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        plugins: ['apollo-angular'],
   *        config: {
   *          serviceProvidedIn: './path/to/module#MyModule'
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  serviceProvidedIn?: string;
  /**
   * @description Set to `true` in order to generate a SDK service class that uses all generated services.
   * @default false
   */
  sdkClass?: boolean;
  /**
   * @description Allows to define a custom suffix for query operations.
   * @default GQL
   *
   * @exampleMarkdown
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        plugins: ['apollo-angular'],
   *        config: {
   *          querySuffix: 'QueryService'
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  querySuffix?: string;
  /**
   * @description Allows to define a custom suffix for mutation operations.
   * @default GQL
   *
   * @exampleMarkdown
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        plugins: ['apollo-angular'],
   *        config: {
   *          mutationSuffix: 'MutationService'
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  mutationSuffix?: string;
  /**
   * @description Allows to define a custom suffix for Subscription operations.
   * @default GQL
   *
   * @exampleMarkdown
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        plugins: ['apollo-angular'],
   *        config: {
   *          subscriptionSuffix: 'SubscriptionService'
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  subscriptionSuffix?: 'GQL' | string;
  /**
   * @description Allows to define a custom Apollo-Angular package to import types from.
   * @default 'apollo-angular'
   */
  apolloAngularPackage?: 'apollo-angular' | string;
  /**
   * @description Add additional dependency injections for generated services
   * @default []
   *
   * @exampleMarkdown
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        plugins: ['apollo-angular'],
   *        config: {
   *          additionalDI: ['testService: TestService', 'testService1': TestService1']
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  additionalDI?: string[];
  /**
   * @description Add `override` modifier to make the generated code compatible with the `noImplicitOverride` option of Typescript v4.3+.
   * @default false
   *
   * @exampleMarkdown
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        plugins: ['apollo-angular'],
   *        config: {
   *          addExplicitOverride: true
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  addExplicitOverride?: boolean;
}
