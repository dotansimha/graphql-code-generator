import { RawResolversConfig } from '@graphql-codegen/visitor-plugin-common';

/**
 * @description This plugin generates resolvers signature based on your `GraphQLSchema`.
 *
 * It generates types for your entire schema: types, input types, enum, interface, scalar and union.
 *
 * This plugin requires you to use `@graphql-codegen/flow` as well, because it depends on it's types.
 */
export interface FlowResolversPluginConfig extends RawResolversConfig {}
