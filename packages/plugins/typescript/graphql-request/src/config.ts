import { RawClientSideBasePluginConfig } from '@graphql-codegen/visitor-plugin-common';

/**
 * @description By default the `request` method return the `data` or `errors` key from the response. If you need to access the `extensions` key you can use the `rawRequest` method.
 * @default false
 *
 * @examples
 * ```yml
 * generates:
 * path/to/file.ts:
 *  plugins:
 *    - typescript
 *    - typescript-operations
 *    - typescript-graphql-request
 *  config:
 *    rawRequest: true
 * ```
 */
export interface RawGraphQLRequestPluginConfig extends RawClientSideBasePluginConfig {
  rawRequest?: boolean;
}
