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
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file.ts': {
   *        plugins: ['typescript', 'typescript-resolvers', 'typescript-stencil-apollo'],
   *        config: {
   *          componentType: 'class'
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  componentType?: StencilComponentType;
}

export enum StencilComponentType {
  functional = 'functional',
  class = 'class',
}
