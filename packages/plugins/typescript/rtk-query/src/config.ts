import { ClientSideBasePluginConfig, RawClientSideBasePluginConfig } from '@graphql-codegen/visitor-plugin-common';

export interface RTKConfig {
  /**
   * @name importBaseApiFrom
   * @description Define where to import the base api to inject endpoints into
   *
   * @exampleMarkdown
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file.ts': {
   *        plugins: ['typescript', 'typescript-resolvers', 'typescript-rtk-query'],
   *        config: {
   *          importBaseApiFrom: 'src/app/api/baseApi',
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  importBaseApiFrom: string;
  /**
   * @name exportHooks
   * @description Whether to export React Hooks from the generated api. Enable only when using the `"@reduxjs/toolkit/query/react"` import of `createApi`
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
   *        plugins: ['typescript', 'typescript-resolvers', 'typescript-rtk-query'],
   *        config: {
   *          importBaseApiFrom: 'src/app/api/baseApi',
   *          exportHooks: true
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  exportHooks?: boolean;
  /**
   * @name overrideExisting
   * @description Sets the `overrideExisting` option, for example to allow for hot module reloading when running graphql-codegen in watch mode.
   * Will directly be injected as code.
   * @default undefined
   *

   * @exampleMarkdown
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file.ts': {
   *        plugins: ['typescript', 'typescript-resolvers', 'typescript-rtk-query'],
   *        config: {
   *          importBaseApiFrom: 'src/app/api/baseApi',
   *          overrideExisting: 'module.hot?.status() === "apply"'
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  overrideExisting?: string;
}

export interface RTKQueryRawPluginConfig extends RawClientSideBasePluginConfig, RTKConfig {}
export interface RTKQueryPluginConfig extends ClientSideBasePluginConfig, RTKConfig {}
