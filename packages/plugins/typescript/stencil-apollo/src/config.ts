import { RawClientSideBasePluginConfig } from '@graphql-codegen/visitor-plugin-common';

export interface StencilApolloRawPluginConfig extends RawClientSideBasePluginConfig {
  /**
   * @description Customize the output of the plugin - you can choose to generate a Component class or a function component.
   * @default functional
   *
   * @examples
   * ```yml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - typescript
   *    - typescript-operations
   *    - typescript-stencil-apollo
   *  config:
   *    componentType: class
   * ```
   */
  componentType?: StencilComponentType;
}

export enum StencilComponentType {
  functional = 'functional',
  class = 'class',
}
