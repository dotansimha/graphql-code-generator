import { RawClientSideBasePluginConfig } from '@graphql-codegen/visitor-plugin-common';

/**
 * @description This plugin generates @vue/apollo-composable composition functions with TypeScript typings.
 *
 * It extends the basic TypeScript plugins: `@graphql-codegen/typescript`, `@graphql-codegen/typescript-operations` - and thus shares a similar configuration.
 *
 */
export interface VueApolloRawPluginConfig extends RawClientSideBasePluginConfig {
  /**
   * @description Customized the output by enabling/disabling the generated Vue composition functions.
   * @default true
   *
   * @exampleMarkdown
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file.ts': {
   *        plugins: ['typescript', 'typescript-operations', 'typescript-vue-apollo'],
   *        config: {
   *          withCompositionFunctions: true
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  withCompositionFunctions?: boolean;
  /**
   * @name vueApolloComposableImportFrom
   * @default @vue/apollo-composable
   *
   * @exampleMarkdown
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file.ts': {
   *        plugins: ['typescript', 'typescript-operations', 'typescript-vue-apollo'],
   *        config: {
   *          vueApolloComposableImportFrom: 'vue'
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  vueApolloComposableImportFrom?: 'vue' | '@vue/apollo-composable' | string;
  /**
   * @name vueCompositionApiImportFrom
   * @default @vue/composition-api
   *
   * @exampleMarkdown
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file.ts': {
   *        plugins: ['typescript', 'typescript-operations', 'typescript-vue-apollo'],
   *        config: {
   *          vueCompositionApiImportFrom: 'vue'
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  vueCompositionApiImportFrom?: 'vue' | '@vue/composition-api' | string;
  /**
   * @description Allows you to enable/disable the generation of docblocks in generated code.
   * Some IDE's (like VSCode) add extra inline information with docblocks, you can disable this feature if your preferred IDE does not.
   * @default true
   *
   * @exampleMarkdown
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file.ts': {
   *        plugins: ['typescript', 'typescript-operations', 'typescript-vue-apollo'],
   *        config: {
   *          addDocBlocks: true
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  addDocBlocks?: boolean;
}
