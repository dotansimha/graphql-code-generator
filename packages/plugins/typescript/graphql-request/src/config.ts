import { RawClientSideBasePluginConfig } from '@graphql-codegen/visitor-plugin-common';

/**
 * @description This plugin generates [`graphql-request`](https://npmjs.com/package/graphql-request) ready-to-use SDK, which is fully-typed.
 */

export interface RawGraphQLRequestPluginConfig extends RawClientSideBasePluginConfig {
  /**
   * @description By default, the `request` method return the `data` or `errors` key from the response. If you need to access the `extensions` key you can use the `rawRequest` method.
   * @default false
   *
   * @exampleMarkdown
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file.ts': {
   *        plugins: ['typescript', 'typescript-operations', 'typescript-graphql-request'],
   *        config: {
   *          rawRequest: true
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  rawRequest?: boolean;

  /**
   * @description Allows you to override the type for extensions when `rawRequest` is enabled.
   * @default any
   *
   * @exampleMarkdown
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file.ts': {
   *        plugins: ['typescript', 'typescript-operations', 'typescript-graphql-request'],
   *        config: {
   *          rawRequest: true,
   *          extensionsType: 'unknown'
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  extensionsType?: string;
}
