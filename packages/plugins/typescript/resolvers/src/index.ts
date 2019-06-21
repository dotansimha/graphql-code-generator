import { RawResolversConfig, OMIT_TYPE } from '@graphql-codegen/visitor-plugin-common';
import { Types, PluginFunction } from '@graphql-codegen/plugin-helpers';
import { isScalarType, parse, printSchema, visit, GraphQLSchema } from 'graphql';
import { TypeScriptResolversVisitor } from './visitor';

export interface TypeScriptResolversPluginConfig extends RawResolversConfig {
  /**
   * @name immutableTypes
   * @type boolean
   * @description Generates immutable types by adding `readonly` to properties and uses `ReadonlyArray`.
   * @default false
   *
   * @example
   * ```yml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - typescript
   *    - typescript-resolvers
   *  config:
   *    immutableTypes: true
   * ```
   */
  immutableTypes?: boolean;
  /**
   * @name useIndexSignature
   * @type boolean
   * @description Adds an index signature to any generates resolver.
   * @default false
   *
   * @example
   * ```yml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - typescript
   *    - typescript-resolvers
   *  config:
   *    useIndexSignature: true
   * ```
   */
  useIndexSignature?: boolean;
  /**
   * @name noSchemaStitching
   * @type boolean
   * @description Disables Schema Stitching support
   * @default false
   * @warning The default behavior will be reversed in the next major release. Support for Schema Stitching will be disabled by default.
   *
   * @example
   * ```yml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - typescript
   *    - typescript-resolvers
   *  config:
   *    noSchemaStitching: true
   * ```
   */
  noSchemaStitching?: boolean;
}

export const plugin: PluginFunction<TypeScriptResolversPluginConfig> = (schema: GraphQLSchema, documents: Types.DocumentFile[], config: TypeScriptResolversPluginConfig) => {
  const imports = ['GraphQLResolveInfo'];
  const showUnusedMappers = typeof config.showUnusedMappers === 'boolean' ? config.showUnusedMappers : true;
  const noSchemaStitching = typeof config.noSchemaStitching === 'boolean' ? config.noSchemaStitching : false;
  const hasScalars = Object.values(schema.getTypeMap())
    .filter(t => t.astNode)
    .some(isScalarType);

  if (config.noSchemaStitching === false) {
    console['warn'](`The default behavior of 'noSchemaStitching' will be reversed in the next major release. Support for Schema Stitching will be disabled by default.`);
  }

  if (hasScalars) {
    imports.push('GraphQLScalarType', 'GraphQLScalarTypeConfig');
  }

  const indexSignature = config.useIndexSignature ? ['export type WithIndex<TObject> = TObject & Record<string, any>;', 'export type ResolversObject<TObject> = WithIndex<TObject>;'].join('\n') : '';

  const visitor = new TypeScriptResolversVisitor(config, schema);

  const stitchingResolverType = `
export type StitchingResolver<TResult, TParent, TContext, TArgs> = {
  fragment: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
`;
  const resolverType = `export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =`;
  const resolverFnUsage = `ResolverFn<TResult, TParent, TContext, TArgs>`;
  const stitchingResolverUsage = `StitchingResolver<TResult, TParent, TContext, TArgs>`;

  // Wrapper of every ResolverType
  const resolverTypeWrapper = `export type ResolverTypeWrapper<T> = Promise<T> | T;`;

  let resolverDefs: string;

  if (noSchemaStitching) {
    // Resolver = ResolverFn;
    resolverDefs = `${resolverType} ${resolverFnUsage};`;
  } else {
    // StitchingResolver
    // Resolver =
    // | ResolverFn
    // | StitchingResolver;
    resolverDefs = [stitchingResolverType, resolverType, `  | ${resolverFnUsage}`, `  | ${stitchingResolverUsage};`].join('\n');
  }

  const header = `${indexSignature}

${resolverTypeWrapper}

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

${resolverDefs}

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

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, TParent, TContext, TArgs>;
}

export type SubscriptionResolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionResolverObject<TResult, TParent, TContext, TArgs>)
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

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
  const resolversTypeMapping = visitor.buildResolversTypes();
  const resolversParentTypeMapping = visitor.buildResolversParentTypes();
  const { getRootResolver, getAllDirectiveResolvers, mappersImports, unusedMappers } = visitor;

  if (showUnusedMappers && unusedMappers.length) {
    console['warn'](`Unused mappers: ${unusedMappers.join(',')}`);
  }

  return {
    prepend: [`import { ${imports.join(', ')} } from 'graphql';`, ...mappersImports, OMIT_TYPE],
    content: [header, resolversTypeMapping, resolversParentTypeMapping, ...visitorResult.definitions.filter(d => typeof d === 'string'), getRootResolver(), getAllDirectiveResolvers()].join('\n'),
  };
};

export { TypeScriptResolversVisitor };
