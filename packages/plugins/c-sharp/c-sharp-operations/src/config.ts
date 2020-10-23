import { RawClientSideBasePluginConfig } from '@graphql-codegen/visitor-plugin-common';

/**
 * @description This plugin generates C# `class` based on your GraphQL operations.
 */
export interface CSharpOperationsRawPluginConfig extends RawClientSideBasePluginConfig {
  /**
   * @default GraphQLCodeGen
   * @description Allow you to customize the namespace name.
   *
   * @exampleMarkdown
   * ```yml
   * config:
   *   namespaceName: MyCompany.MyNamespace
   * ```
   */
  namespaceName?: string;
  /**
   * @description Defined the global value of `namedClient`.
   *
   * @exampleMarkdown
   * ```yml
   * config:
   *   namedClient: 'customName'
   * ```
   */
  namedClient?: string;
  /**
   * @description Allows to define a custom suffix for query operations.
   * @default GQL
   *
   * @exampleMarkdown
   * ```yml
   * config:
   *   querySuffix: 'QueryService'
   * ```
   */
  querySuffix?: string;
  /**
   * @description Allows to define a custom suffix for mutation operations.
   * @default GQL
   *
   * @exampleMarkdown
   * ```yml
   * config:
   *   mutationSuffix: 'MutationService'
   * ```
   */
  mutationSuffix?: string;
  /**
   * @description Allows to define a custom suffix for Subscription operations.
   * @default GQL
   *
   * @exampleMarkdown
   * ```yml
   * config:
   *   subscriptionSuffix: 'SubscriptionService'
   * ```
   */
  subscriptionSuffix?: string;
  /**
   * @description Allows to generate operation methods with class definitions for request/response parameters
   * @default false
   *
   * @exampleMarkdown
   * ```yml
   * config:
   *   typesafeOperation: true
   * ```
   */
  typesafeOperation?: boolean;
}
