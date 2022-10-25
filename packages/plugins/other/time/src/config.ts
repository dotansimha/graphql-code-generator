export interface TimePluginConfig {
  /**
   * @description Customize the Moment format of the output time.
   * @default YYYY-MM-DDTHH:mm:ssZ
   *
   * @exampleMarkdown
   * ```tsx {10} filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    schema: 'https://localhost:4000/graphql',
   *    documents: ['src/**\/*.tsx'],
   *    generates: {
   *      'path/to/file.ts': {
   *        plugins: ['time'],
   *        config: {
   *          format: 'DD.MM.YY'
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  format?: string;
  /**
   * @description Customize the comment message
   * @default 'Generated on'
   *
   * @exampleMarkdown
   * ```tsx {10} filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    schema: 'https://localhost:4000/graphql',
   *    documents: ['src/**\/*.tsx'],
   *    generates: {
   *      'path/to/file.ts': {
   *        plugins: ['time'],
   *        config: {
   *          message: 'The file generated on: '
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  message?: string;
}
