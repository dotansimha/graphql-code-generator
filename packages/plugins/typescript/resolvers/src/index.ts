import { printSchemaWithDirectives } from 'graphql-toolkit';
import { RawResolversConfig } from '@graphql-codegen/visitor-plugin-common';
import { Types, PluginFunction, addFederationReferencesToSchema } from '@graphql-codegen/plugin-helpers';
import { isScalarType, parse, visit, GraphQLSchema, printSchema } from 'graphql';
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

  if (config.noSchemaStitching === false) {
    console['warn'](`The default behavior of 'noSchemaStitching' will be reversed in the next major release. Support for Schema Stitching will be disabled by default.`);
  }

  const indexSignature = config.useIndexSignature ? ['export type WithIndex<TObject> = TObject & Record<string, any>;', 'export type ResolversObject<TObject> = WithIndex<TObject>;'].join('\n') : '';

  const transformedSchema = config.federation ? addFederationReferencesToSchema(schema) : schema;
  const visitor = new TypeScriptResolversVisitor(config, transformedSchema);

  const defsToInclude = [];
  const stitchingResolverType = `
export type StitchingResolver<TResult, TParent, TContext, TArgs> = {
  fragment: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
`;
  const resolverType = `export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =`;
  const resolverFnUsage = `ResolverFn<TResult, TParent, TContext, TArgs>`;
  const stitchingResolverUsage = `StitchingResolver<TResult, TParent, TContext, TArgs>`;

  if (visitor.hasFederation()) {
    defsToInclude.push(`export type ReferenceResolver<TResult, TReference, TContext> = (
      reference: TReference,
      context: TContext,
      info: GraphQLResolveInfo
    ) => Promise<TResult> | TResult;`);
  }

  if (noSchemaStitching) {
    // Resolver = ResolverFn;
    defsToInclude.push(`${resolverType} ${resolverFnUsage};`);
  } else {
    // StitchingResolver
    // Resolver =
    // | ResolverFn
    // | StitchingResolver;
    defsToInclude.push([stitchingResolverType, resolverType, `  | ${resolverFnUsage}`, `  | ${stitchingResolverUsage};`].join('\n'));
  }

  const header = `${indexSignature}

${visitor.getResolverTypeWrapperSignature()}

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

${defsToInclude.join('\n')}

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

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

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

  const printedSchema = config.federation ? printSchemaWithDirectives(transformedSchema) : printSchema(transformedSchema);
  const astNode = parse(printedSchema);
  const visitorResult = visit(astNode, { leave: visitor });
  const resolversTypeMapping = visitor.buildResolversTypes();
  const resolversParentTypeMapping = visitor.buildResolversParentTypes();
  const { getRootResolver, getAllDirectiveResolvers, mappersImports, unusedMappers, hasScalars } = visitor;

  if (hasScalars()) {
    imports.push('GraphQLScalarType', 'GraphQLScalarTypeConfig');
  }

  if (showUnusedMappers && unusedMappers.length) {
    console['warn'](`Unused mappers: ${unusedMappers.join(',')}`);
  }

  return {
    prepend: [`import { ${imports.join(', ')} } from 'graphql';`, ...mappersImports, ...visitor.globalDeclarations],
    content: [header, resolversTypeMapping, resolversParentTypeMapping, ...visitorResult.definitions.filter(d => typeof d === 'string'), getRootResolver(), getAllDirectiveResolvers()].join('\n'),
  };
};

export { TypeScriptResolversVisitor };
