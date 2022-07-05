import { DecoratorConfig } from './visitor.js';
import { TypeScriptPluginConfig } from '@graphql-codegen/typescript';

export interface TypeGraphQLPluginConfig extends TypeScriptPluginConfig {
  /**
   * @name decoratorName
   * @description allow overriding of TypeGraphQL decorator types
   * @default { type: 'ObjectType', interface: 'InterfaceType', arguments: 'ArgsType', field: 'Field', input: 'InputType' }
   */
  decoratorName?: Partial<DecoratorConfig>;

  /**
   * @name decorateTypes
   * @description Specifies the objects that will have TypeGraphQL decorators prepended to them, by name. Non-matching types will still be output, but without decorators. If not set, all types will be decorated.
   * @type string[]
   * @example Decorate only type User
   * ```yaml
   * generates:
   *   types.ts:
   *     plugins:
   *       - typescript-type-graphql
   *     config:
   *       decorateTypes:
   *         - User
   * ```
   */
  decorateTypes?: string[];
}
