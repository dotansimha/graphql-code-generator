import { RawClientSideBasePluginConfig } from '@graphql-codegen/visitor-plugin-common';

/**
 * This plugin generate a generic SDK (without any Requester implemented), allow you to easily customize the way you fetch your data, without loosing the strongly-typed integration.
 */
export interface RawGenericSdkPluginConfig extends RawClientSideBasePluginConfig {
  /**
   * usingObservableFrom: `import Observable from 'zen-observable'`
   * OR
   * usingObservableFrom: `import { Observable } from 'rxjs'`
   */
  usingObservableFrom?: string;

  /**
   * @description By default the `request` method return the `data` or `errors` key from the response. If you need to access the `extensions` key you can use the `rawRequest` method.
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
   *        plugins: ['typescript', 'typescript-operations', 'typescript-generic-sdk'],
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
}
