import { RawConfig } from '@graphql-codegen/visitor-plugin-common';

/**
 * @description If you are migrating from <1.0, we created a new plugin called `typescript-compatibility` that generates backward compatibility for the `typescript-operations` and `typescript-react-apollo` plugins.
 *
 * It generates types that are pointing to the new form of types. It supports _most_ of the use-cases.
 */
export interface CompatibilityPluginRawConfig extends RawConfig {
  /**
   * @description Does not generate TypeScript `namespace`s and uses the operation name as prefix.
   * @default false
   *
   * @exampleMarkdown
   * ```yml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - typescript
   *    - typescript-operations
   *    - typescript-compatibility
   *  config:
   *    noNamespaces: true
   * ```
   */
  noNamespaces?: boolean;
  /**
   * @description Make sure to generate code that compatible with TypeScript strict mode.
   * @default false
   *
   * @exampleMarkdown
   * ```yml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - typescript
   *    - typescript-operations
   *    - typescript-compatibility
   *  config:
   *    strict: true
   * ```
   */
  strict?: boolean;
  /**
   * @description Avoid using `Pick` in `typescript-operations` and make sure to optimize this package as well.
   * @default false
   */
  preResolveTypes?: boolean;
}
