import { RawResolversConfig } from '@graphql-codegen/visitor-plugin-common';
import { Types, PluginFunction } from '@graphql-codegen/plugin-helpers';
import { isScalarType, parse, printSchema, visit, GraphQLSchema } from 'graphql';
import { FlowResolversVisitor } from './visitor';

export interface FlowResolversPluginConfig extends RawResolversConfig {}

export const plugin: PluginFunction<FlowResolversPluginConfig> = (schema: GraphQLSchema, documents: Types.DocumentFile[], config: FlowResolversPluginConfig) => {
  const imports = ['type GraphQLResolveInfo'];
  const showUnusedMappers = typeof config.showUnusedMappers === 'boolean' ? config.showUnusedMappers : true;
  const hasScalars = Object.values(schema.getTypeMap())
    .filter(t => t.astNode)
    .some(isScalarType);

  if (hasScalars) {
    imports.push('type GraphQLScalarTypeConfig');
  }

  const gqlImports = `import { ${imports.join(', ')} } from 'graphql';`;

  // Wrapper of every ResolverType
  const resolverTypeWrapper = config.asyncResolverTypes ? `export type ResolverTypeWrapper<T> = Promise<T> | T;` : `export type ResolverTypeWrapper<T> = T;`;

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

export interface ISubscriptionResolverObject<Result, Parent, Context, Args> {
  subscribe: SubscriptionSubscribeFn<Result, Parent, Context, Args>;
  resolve?: SubscriptionResolveFn<Result, Parent, Context, Args>;
}

export type SubscriptionResolver<Result, Parent = {}, Context = {}, Args = {}> =
  | ((...args: Array<any>) => ISubscriptionResolverObject<Result, Parent, Context, Args>)
  | ISubscriptionResolverObject<Result, Parent, Context, Args>;

export type TypeResolveFn<Types, Parent = {}, Context = {}> = (
  parent: Parent,
  context: Context,
  info: GraphQLResolveInfo
) => ?Types;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<Result = {}, Parent = {}, Args = {}, Context = {}> = (
  next: NextResolverFn<Result>,
  parent: Parent,
  args: Args,
  context: Context,
  info: GraphQLResolveInfo
) => Result | Promise<Result>;

${resolverTypeWrapper}
`;

  const printedSchema = printSchema(schema);
  const astNode = parse(printedSchema);
  const visitor = new FlowResolversVisitor(config, schema);
  const visitorResult = visit(astNode, { leave: visitor });
  const resolversTypeMapping = visitor.buildResolversTypes();
  const { getRootResolver, getAllDirectiveResolvers, mappersImports, unusedMappers } = visitor;

  if (showUnusedMappers && unusedMappers.length) {
    console['warn'](`Unused mappers: ${unusedMappers.join(',')}`);
  }

  return {
    prepend: [gqlImports, ...mappersImports],
    content: [header, resolversTypeMapping, ...visitorResult.definitions.filter(d => typeof d === 'string'), getRootResolver(), getAllDirectiveResolvers()].join('\n'),
  };
};
