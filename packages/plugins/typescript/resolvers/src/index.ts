import { parseMapper } from '@graphql-codegen/visitor-plugin-common';
import {
  Types,
  PluginFunction,
  addFederationReferencesToSchema,
  getCachedDocumentNodeFromSchema,
} from '@graphql-codegen/plugin-helpers';
import { visit, GraphQLSchema } from 'graphql';
import { TypeScriptResolversVisitor } from './visitor';
import { TypeScriptResolversPluginConfig } from './config';
import { TsVisitor } from '@graphql-codegen/typescript';

export const plugin: PluginFunction<TypeScriptResolversPluginConfig, Types.ComplexPluginOutput> = (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: TypeScriptResolversPluginConfig
) => {
  const imports = [];
  if (!config.customResolveInfo) {
    imports.push('GraphQLResolveInfo');
  }
  const showUnusedMappers = typeof config.showUnusedMappers === 'boolean' ? config.showUnusedMappers : true;
  const noSchemaStitching = typeof config.noSchemaStitching === 'boolean' ? config.noSchemaStitching : true;

  const indexSignature = config.useIndexSignature
    ? [
        'export type WithIndex<TObject> = TObject & Record<string, any>;',
        'export type ResolversObject<TObject> = WithIndex<TObject>;',
      ].join('\n')
    : '';

  const transformedSchema = config.federation ? addFederationReferencesToSchema(schema) : schema;
  const visitor = new TypeScriptResolversVisitor(config, transformedSchema);
  const tsVisitor = new TsVisitor(transformedSchema, config);
  const namespacedImportPrefix = visitor.config.namespacedImportName ? `${visitor.config.namespacedImportName}.` : '';

  const astNode = getCachedDocumentNodeFromSchema(transformedSchema);
  // runs visitor
  const visitorResult = visit(astNode, { leave: visitor });

  const optionalSignForInfoArg = visitor.config.optionalInfoArgument ? '?' : '';
  const prepend: string[] = [];
  const defsToInclude: string[] = [];
  const legacyStitchingResolverType = `
export type LegacyStitchingResolver<TResult, TParent, TContext, TArgs> = {
  fragment: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};`;
  const newStitchingResolverType = `
export type NewStitchingResolver<TResult, TParent, TContext, TArgs> = {
  selectionSet: string;
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};`;
  const stitchingResolverType = `export type StitchingResolver<TResult, TParent, TContext, TArgs> = LegacyStitchingResolver<TResult, TParent, TContext, TArgs> | NewStitchingResolver<TResult, TParent, TContext, TArgs>;`;
  const resolverWithResolve = `
export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};`;
  const resolverType = `export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =`;
  const resolverFnUsage = `ResolverFn<TResult, TParent, TContext, TArgs>`;
  const resolverWithResolveUsage = `ResolverWithResolve<TResult, TParent, TContext, TArgs>`;
  const stitchingResolverUsage = `StitchingResolver<TResult, TParent, TContext, TArgs>`;

  if (visitor.hasFederation()) {
    if (visitor.config.wrapFieldDefinitions) {
      defsToInclude.push(`export type UnwrappedObject<T> = {
        [P in keyof T]: T[P] extends infer R | Promise<infer R> | (() => infer R2 | Promise<infer R2>)
          ? R & R2 : T[P]
      };`);
    }

    defsToInclude.push(`export type ReferenceResolver<TResult, TReference, TContext> = (
      reference: TReference,
      context: TContext,
      info${optionalSignForInfoArg}: GraphQLResolveInfo
    ) => Promise<TResult> | TResult;`);

    defsToInclude.push(`
      type ScalarCheck<T, S> = S extends true ? T : NullableCheck<T, S>;
      type NullableCheck<T, S> = ${namespacedImportPrefix}Maybe<T> extends T ? ${namespacedImportPrefix}Maybe<ListCheck<NonNullable<T>, S>> : ListCheck<T, S>;
      type ListCheck<T, S> = T extends (infer U)[] ? NullableCheck<U, S>[] : GraphQLRecursivePick<T, S>;
      export type GraphQLRecursivePick<T, S> = { [K in keyof T & keyof S]: ScalarCheck<T[K], S[K]> };
    `);
  }

  defsToInclude.push(resolverWithResolve);
  if (noSchemaStitching) {
    // Resolver = ResolverFn | ResolverWithResolve;
    defsToInclude.push(`${resolverType} ${resolverFnUsage} | ${resolverWithResolveUsage};`);
  } else {
    // StitchingResolver
    // Resolver =
    // | ResolverFn
    // | ResolverWithResolve
    // | StitchingResolver;
    defsToInclude.push(
      [
        legacyStitchingResolverType,
        newStitchingResolverType,
        stitchingResolverType,
        resolverType,
        `  | ${resolverFnUsage}`,
        `  | ${resolverWithResolveUsage}`,
        `  | ${stitchingResolverUsage};`,
      ].join('\n')
    );
  }

  const importType = config.useTypeImports ? 'import type' : 'import';

  if (config.customResolverFn) {
    const parsedMapper = parseMapper(config.customResolverFn);
    if (parsedMapper.isExternal) {
      if (parsedMapper.default) {
        prepend.push(`${importType} ResolverFn from '${parsedMapper.source}';`);
      } else {
        prepend.push(
          `${importType} { ${parsedMapper.import} ${
            parsedMapper.import !== 'ResolverFn' ? 'as ResolverFn ' : ''
          }} from '${parsedMapper.source}';`
        );
      }
      prepend.push(`export${config.useTypeImports ? ' type' : ''} { ResolverFn };`);
    } else {
      prepend.push(`export type ResolverFn<TResult, TParent, TContext, TArgs> = ${parsedMapper.type}`);
    }
  } else {
    const defaultResolverFn = `
export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info${optionalSignForInfoArg}: GraphQLResolveInfo
) => Promise<TResult> | TResult;`;

    defsToInclude.push(defaultResolverFn);
  }

  const header = `${indexSignature}

${visitor.getResolverTypeWrapperSignature()}

${defsToInclude.join('\n')}

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info${optionalSignForInfoArg}: GraphQLResolveInfo
) => AsyncIterator<TResult> | Promise<AsyncIterator<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info${optionalSignForInfoArg}: GraphQLResolveInfo
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
  info${optionalSignForInfoArg}: GraphQLResolveInfo
) => ${namespacedImportPrefix}Maybe<TTypes> | Promise<${namespacedImportPrefix}Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info${optionalSignForInfoArg}: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info${optionalSignForInfoArg}: GraphQLResolveInfo
) => TResult | Promise<TResult>;
`;

  const resolversTypeMapping = visitor.buildResolversTypes();
  const resolversParentTypeMapping = visitor.buildResolversParentTypes();
  const { getRootResolver, getAllDirectiveResolvers, mappersImports, unusedMappers, hasScalars } = visitor;

  if (hasScalars()) {
    imports.push('GraphQLScalarType', 'GraphQLScalarTypeConfig');
  }

  if (showUnusedMappers && unusedMappers.length) {
    // eslint-disable-next-line no-console
    console.warn(`Unused mappers: ${unusedMappers.join(',')}`);
  }

  if (imports.length) {
    prepend.push(`${importType} { ${imports.join(', ')} } from 'graphql';`);
  }

  if (config.customResolveInfo) {
    const parsedMapper = parseMapper(config.customResolveInfo);
    if (parsedMapper.isExternal) {
      if (parsedMapper.default) {
        prepend.push(`import GraphQLResolveInfo from '${parsedMapper.source}'`);
      }
      prepend.push(
        `import { ${parsedMapper.import} ${
          parsedMapper.import !== 'GraphQLResolveInfo' ? 'as GraphQLResolveInfo' : ''
        } } from '${parsedMapper.source}';`
      );
    } else {
      prepend.push(`type GraphQLResolveInfo = ${parsedMapper.type}`);
    }
  }

  prepend.push(...mappersImports, ...visitor.globalDeclarations);

  const scalars = tsVisitor.createScalarsDefinition({
    scalarsMap: visitor.config.scalars,
    declarationName: 'ResolverScalars',
  });
  const internalScalars = visitor.config.inputScalars
    ? tsVisitor.createScalarsDefinition({
        scalarsMap: visitor.config.inputScalars,
        declarationName: 'InputResolverScalars',
      })
    : undefined;

  return {
    prepend,
    content: [
      header,
      scalars,
      internalScalars,
      resolversTypeMapping,
      resolversParentTypeMapping,
      ...visitorResult.definitions.filter(d => typeof d === 'string'),
      getRootResolver(),
      getAllDirectiveResolvers(),
    ]
      .filter(v => v != null)
      .join('\n'),
  };
};

export { TypeScriptResolversVisitor, TypeScriptResolversPluginConfig };
