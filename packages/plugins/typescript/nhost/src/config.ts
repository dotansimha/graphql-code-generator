/**
 * My plugin is super cool!!!
 */
export type MyPluginConfig = {
  /**
   * @name name
   * @description This allows you to generate a greeting with a custom name
   * @default anonymous
   *
   * @exampleMarkdown
   * ## Change the name
   * ```yaml
   * generates:
   *   path/to/file.ts:
   *     plugins:
   *       - my-plugin
   *     config:
   *       name: Uri
   * ```
   */
  name: string;
};
