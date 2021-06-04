import { ClientSideBasePluginConfig, RawClientSideBasePluginConfig } from '@graphql-codegen/visitor-plugin-common';

export interface RTKConfig {
  /**
   * @name importBaseApiFrom
   * @description Define where to import the base api to inject endpoints into
   *
   * @exampleMarkdown
   * ```yml
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
   * ```yml
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
  exportHooks: boolean;
}

export interface RTKQueryRawPluginConfig extends RawClientSideBasePluginConfig, RTKConfig {}
export interface RTKQueryPluginConfig extends ClientSideBasePluginConfig, RTKConfig {}
