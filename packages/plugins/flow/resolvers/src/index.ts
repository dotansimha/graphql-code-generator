import { printSchemaWithDirectives } from '@graphql-tools/utils';
import { RawResolversConfig } from '@graphql-codegen/visitor-plugin-common';
import { Types, PluginFunction, addFederationReferencesToSchema } from '@graphql-codegen/plugin-helpers';
import { parse, printSchema, visit, GraphQLSchema } from 'graphql';
import { FlowResolversVisitor } from './visitor';

/**
 * @description This plugin generates resolvers signature based on your `GraphQLSchema`.
 *
 * It generates types for your entire schema: types, input types, enum, interface, scalar and union.
 *
 * This plugin requires you to use `@graphql-codegen/flow` as well, because it depends on it's types.
 */
export interface RawFlowResolversConfig extends RawResolversConfig {}

export const plugin: PluginFunction<RawFlowResolversConfig, Types.ComplexPluginOutput> = (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: RawFlowResolversConfig
) => {
  const imports = ['type GraphQLResolveInfo'];
  const showUnusedMappers = typeof config.showUnusedMappers === 'boolean' ? config.showUnusedMappers : true;

  const gqlImports = `import { ${imports.join(', ')} } from 'graphql';`;

  const transformedSchema = config.federation ? addFederationReferencesToSchema(schema) : schema;

  const printedSchema = config.federation
    ? printSchemaWithDirectives(transformedSchema)
    : printSchema(transformedSchema);
  const astNode = parse(printedSchema);
  const visitor = new FlowResolversVisitor(config, transformedSchema);
  const visitorResult = visit(astNode, { leave: visitor });

  const defsToInclude: string[] = [visitor.getResolverTypeWrapperSignature()];

  if (visitor.hasFederation()) {
    defsToInclude.push(`
    export type ReferenceResolver<TResult, TReference, TContext> = (
      reference: TReference,
      context: TContext,
      info: GraphQLResolveInfo
    ) => Promise<TResult> | TResult;
    `);

    defsToInclude.push(`export type RecursivePick<T, U> = T`);
  }

  const header = `export type Resolver<Result, Parent = {}, Context = {}, Args = {}> = (
  parent: Parent,
  args: Args,
  context: Context,
  info: GraphQLResolveInfo
) => Promise<Result> | Result;

export type SubscriptionSubscribeFn<Result, Parent, Context, Args> = (
  parent: Parent,
  args: Args,
  context: Context,
  info: GraphQLResolveInfo
) => AsyncIterator<Result> | Promise<AsyncIterator<Result>>;

export type SubscriptionResolveFn<Result, Parent, Context, Args> = (
  parent: Parent,
  args: Args,
  context: Context,
  info: GraphQLResolveInfo
) => Result | Promise<Result>;

export interface SubscriptionSubscriberObject<Result, Key: string, Parent, Context, Args> {
  subscribe: SubscriptionSubscribeFn<{ [key: Key]: Result }, Parent, Context, Args>;
  resolve?: SubscriptionResolveFn<Result, { [key: Key]: Result }, Context, Args>;
}

export interface SubscriptionResolverObject<Result, Parent, Context, Args> {
  subscribe: SubscriptionSubscribeFn<mixed, Parent, Context, Args>;
  resolve: SubscriptionResolveFn<Result, mixed, Context, Args>;
}

export type SubscriptionObject<Result, Key: string, Parent, Context, Args> =
  | SubscriptionSubscriberObject<Result, Key, Parent, Context, Args>
  | SubscriptionResolverObject<Result, Parent, Context, Args>;

export type SubscriptionResolver<Result, Key: string, Parent = {}, Context = {}, Args = {}> =
  | ((...args: Array<any>) => SubscriptionObject<Result, Key, Parent, Context, Args>)
  | SubscriptionObject<Result, Key, Parent, Context, Args>;

export type TypeResolveFn<Types, Parent = {}, Context = {}> = (
  parent: Parent,
  context: Context,
  info: GraphQLResolveInfo
) => ?Types | Promise<?Types>;

export type IsTypeOfResolverFn<T = {}, Context = {}> = (obj: T, context: Context, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<Result = {}, Parent = {}, Args = {}, Context = {}> = (
  next: NextResolverFn<Result>,
  parent: Parent,
  args: Args,
  context: Context,
  info: GraphQLResolveInfo
) => Result | Promise<Result>;

${defsToInclude.join('\n')}
`;

  const resolversTypeMapping = visitor.buildResolversTypes();
  const resolversParentTypeMapping = visitor.buildResolversParentTypes();
  const { getRootResolver, getAllDirectiveResolvers, mappersImports, unusedMappers, hasScalars } = visitor;

  if (hasScalars()) {
    imports.push('type GraphQLScalarTypeConfig');
  }

  if (showUnusedMappers && unusedMappers.length) {
    // eslint-disable-next-line no-console
    console.warn(`Unused mappers: ${unusedMappers.join(',')}`);
  }

  return {
    prepend: [gqlImports, ...mappersImports, ...visitor.globalDeclarations],
    content: [
      header,
      resolversTypeMapping,
      resolversParentTypeMapping,
      ...visitorResult.definitions.filter(d => typeof d === 'string'),
      getRootResolver(),
      getAllDirectiveResolvers(),
    ].join('\n'),
  };
};
