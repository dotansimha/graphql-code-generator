import { RawResolversConfig } from 'graphql-codegen-visitor-plugin-common';
import { Types, PluginFunction } from 'graphql-codegen-plugin-helpers';
import { isScalarType, parse, printSchema, visit, GraphQLSchema } from 'graphql';
import { TypeScriptResolversVisitor } from './visitor';

export interface TypeScriptResolversPluginConfig extends RawResolversConfig {
  avoidOptionals?: boolean;
  immutableTypes?: boolean;
  useIndexSignature?: boolean;
}

export const plugin: PluginFunction<TypeScriptResolversPluginConfig> = (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: TypeScriptResolversPluginConfig
) => {
  const imports = ['GraphQLResolveInfo'];
  const hasScalars = Object.values(schema.getTypeMap())
    .filter(t => t.astNode)
    .some(isScalarType);

  if (hasScalars) {
    imports.push('GraphQLScalarType', 'GraphQLScalarTypeConfig');
  }

  const indexSignature = config.useIndexSignature
    ? [
        'export type WithIndex<TObject> = TObject & Record<string, any>;',
        'export type ResolversObject<TObject> = WithIndex<TObject>;'
      ].join('\n')
    : '';

  const visitor = new TypeScriptResolversVisitor(config, schema);

  const header = `
import { ${imports.join(', ')} } from 'graphql';

export type ArrayOrIterable<T> = Array<T> | Iterable<T>;

${indexSignature}

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type StitchingResolver<TResult, TParent, TContext, TArgs> = {
  fragment: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};

export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | StitchingResolver<TResult, TParent, TContext, TArgs>;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterator<TResult> | Promise<AsyncIterator<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface ISubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, TParent, TContext, TArgs>;
}

export type SubscriptionResolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => ISubscriptionResolverObject<TResult, TParent, TContext, TArgs>)
  | ISubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;
`;

  const printedSchema = printSchema(schema);
  const astNode = parse(printedSchema);
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
