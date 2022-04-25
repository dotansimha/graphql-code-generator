import { RawClientSideBasePluginConfig } from '@graphql-codegen/visitor-plugin-common';

/**
 * @description This plugin generates Stencil Apollo functional components typings
 *
 * It extends the basic TypeScript plugins: `@graphql-codegen/typescript`, `@graphql-codegen/typescript-operations` - and thus shares a similar configuration.
 */
export interface StencilApolloRawPluginConfig extends RawClientSideBasePluginConfig {
  /**
   * @description Customize the output of the plugin - you can choose to generate a Component class or a function component.
   * @default functional
   *
   * @exampleMarkdown
   * ```yaml
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
