import { RawTypesConfig } from '@graphql-codegen/visitor-plugin-common';

/**
 * @description This plugin generates the base Python types, based on your GraphQL schema.
 *
 * This is equivalent of the `typescript` plugin. The generated types are simple, refer to your schema's exact structure, and will be used as the base type for future plugins (such as `python-operations`).
 *
 * By default, this package only supports Python 3.8+, since that is the first time literal types were introduced. If you do need support for Python 3.5-3.7, you'll need to use the typenameAsString option.
 *
 * @example
 * ```python
 * from generated_types import MyType
 * # ...
 * def fetchObject() -> MyType
 *    # ...
 *
 * a = fetchObject()
 * # Python will now provide type annotations for your object
 * ```
 */
export interface PythonPluginConfig
  extends Omit<RawTypesConfig, 'declarationKind' | 'fieldWrapperValue' | 'wrapFieldDefinitions'> {
  /**
   * @description Uses `Scalars.String` for typename instead of Literal. It also removes the Literal import. This provides compatibility for Python 3.5-3.7.
   *
   * @exampleMarkdown
   * ## With Custom Values
   * ```yml
   *   config:
   *     typenameAsString: true
   * ```
   */
  typenameAsString?: boolean;
}
