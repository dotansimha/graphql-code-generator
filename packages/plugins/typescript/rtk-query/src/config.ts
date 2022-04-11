import { ClientSideBasePluginConfig, RawClientSideBasePluginConfig } from '@graphql-codegen/visitor-plugin-common';

export interface RTKConfig {
  /**
   * @name importBaseApiFrom
   * @description Define where to import the base api to inject endpoints into
   *
   * @exampleMarkdown
   * ```yaml
   * generates:
   *   ./src/app/api/generated.ts:
   *     plugins:
   *       - typescript
   *       - typescript-operations
   *       - typescript-rtk-query:
   *           importBaseApiFrom: 'src/app/api/baseApi'
   * ```
   */
  importBaseApiFrom: string;
  /**
   * @name exportHooks
   * @description Whether to export React Hooks from the generated api. Enable only when using the `"@reduxjs/toolkit/query/react"` import of `createApi`
   * @default false
   *

   * @exampleMarkdown
   * ```yaml
   * generates:
   *   ./src/app/api/generated.ts:
   *     plugins:
   *       - typescript
   *       - typescript-operations
   *       - typescript-rtk-query:
   *           importBaseApiFrom: 'src/app/api/baseApi'
   *           exportHooks: true
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
   * ```yaml
   * generates:
   *   ./src/app/api/generated.ts:
   *     plugins:
   *       - add:
   *           content: 'module.hot?.accept();'
   *       - typescript
   *       - typescript-operations
   *       - typescript-rtk-query:
   *           importBaseApiFrom: 'src/app/api/baseApi'
   *           overrideExisting: 'module.hot?.status() === "apply"'
   * ```
   */
  overrideExisting?: string;
}

export interface RTKQueryRawPluginConfig extends RawClientSideBasePluginConfig, RTKConfig {}
export interface RTKQueryPluginConfig extends ClientSideBasePluginConfig, RTKConfig {}
