import { ClientSideBasePluginConfig, RawClientSideBasePluginConfig } from '@graphql-codegen/visitor-plugin-common';

interface RTKConfig {
  /**
   * @name rtkQueryImportBaseApiFrom
   * @description Define where to import the base api to extend from
   *
   * @example Change the name
   * ```yml
   * generates:
   *   path/to/file.ts:
   *    plugins:
   *      - rtk-query
   *    config:
   *      name: src/app/services/api.ts
   * ```
   */
  importBaseApiFrom: string;
  /**
   * @name buildHooks
   * @description Whether to export hooks from the generated api. Enable only when using the "@reduxjs/query/react" import of `createApi`
   * @default false
   */
  exportHooks: boolean;
}

export interface RTKQueryRawPluginConfig extends RawClientSideBasePluginConfig, RTKConfig {}
export interface RTKQueryPluginConfig extends ClientSideBasePluginConfig, RTKConfig {}
