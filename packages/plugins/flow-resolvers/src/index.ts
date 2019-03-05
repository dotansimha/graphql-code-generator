import { RawResolversConfig } from 'graphql-codegen-visitor-plugin-common';
import { DocumentFile, PluginFunction } from 'graphql-codegen-core';
import { isScalarType, parse, printSchema, visit, GraphQLSchema } from 'graphql';
import { FlowResolversVisitor } from './visitor';

export interface FlowResolversPluginConfig extends RawResolversConfig {}

export const plugin: PluginFunction<FlowResolversPluginConfig> = (
  schema: GraphQLSchema,
  documents: DocumentFile[],
  config: FlowResolversPluginConfig
) => {
  const imports = ['type GraphQLResolveInfo'];
  const hasScalars = Object.values(schema.getTypeMap())
    .filter(t => t.astNode)
    .some(isScalarType);

  if (hasScalars) {
    imports.push('type GraphQLScalarTypeConfig');
  }

  const header = `
import { ${imports.join(', ')} } from 'graphql';

export type Resolver<Result, Parent = {}, Context = {}, Args = {}> = (
  parent?: Parent,
  args?: Args,
  context?: Context,
  info?: GraphQLResolveInfo
) => Promise<Result> | Result;

export type SubscriptionSubscribeFn<Result, Parent, Context, Args> = (
  parent?: Parent,
  args?: Args,
  context?: Context,
  info?: GraphQLResolveInfo
) => AsyncIterator<Result> | Promise<AsyncIterator<Result>>;

export type SubscriptionResolveFn<Result, Parent, Context, Args> = (
  parent?: Parent,
  args?: Args,
  context?: Context,
  info?: GraphQLResolveInfo
) => Result | Promise<Result>;

export interface ISubscriptionResolverObject<Result, Parent, Context, Args> {
  subscribe: SubscriptionSubscribeFn<Result, Parent, Context, Args>;
  resolve?: SubscriptionResolveFn<Result, Parent, Context, Args>;
}

export type SubscriptionResolver<Result, Parent = {}, Context = {}, Args = {}> =
  | ((...args: any[]) => ISubscriptionResolverObject<Result, Parent, Context, Args>)
  | ISubscriptionResolverObject<Result, Parent, Context, Args>;

export type TypeResolveFn<Types, Parent = {}, Context = {}> = (
  parent?: Parent,
  context?: Context,
  info?: GraphQLResolveInfo
) => ?Types;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult, TArgs = {}, Context = {}> = (
  next?: NextResolverFn<TResult>,
  source?: any,
  args?: TArgs,
  context?: Context,
  info?: GraphQLResolveInfo
) => TResult | Promise<TResult>;
`;

  const printedSchema = printSchema(schema);
  const astNode = parse(printedSchema);
  const visitor = new FlowResolversVisitor(config, schema);
  const visitorResult = visit(astNode, { leave: visitor });
  const { getRootResolver, getAllDirectiveResolvers, mappersImports } = visitor;

  return [
    ...mappersImports,
    header,
    ...visitorResult.definitions.filter(d => typeof d === 'string'),
    getRootResolver(),
    getAllDirectiveResolvers()
  ].join('\n');
};
