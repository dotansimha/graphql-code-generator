export interface TimePluginConfig {
  /**
   * @description Customize the Moment format of the output time.
   * @default YYYY-MM-DDTHH:mm:ssZ
   *
   * @exampleMarkdown
   * ```yaml
   * generates:
   *   path/to/file.ts:
   *     plugins:
   *       - time:
   *           format: DD.MM.YY
   * ```
   */
  format?: string;
  /**
   * @description Customize the comment message
   * @default 'Generated on'
   *
   * @exampleMarkdown
   * ```yaml
   * generates:
   *   path/to/file.ts:
   *     plugins:
   *       - time:
   *           message: 'The file generated on: '
   * ```
   */
  message?: string;
}
