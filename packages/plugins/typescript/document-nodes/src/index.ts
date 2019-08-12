import { PluginFunction, PluginValidateFn, Types } from '@graphql-codegen/plugin-helpers';
import { convertFactory, NamingConvention, LoadedFragment, RawClientSideBasePluginConfig } from '@graphql-codegen/visitor-plugin-common';
import { GraphQLSchema, OperationDefinitionNode, visit, concatAST, FragmentDefinitionNode, Kind } from 'graphql';
import { print } from 'graphql/language/printer';
import { TypeScriptDocumentNodesVisitor } from './visitor';

export interface TypeScriptDocumentNodesRawPluginConfig extends RawClientSideBasePluginConfig {
  /**
   * @name namingConvention
   * @type NamingConvention
   * @default change-case#pascalCase
   * @description Allow you to override the naming convention of the output.
   * You can either override all namings, or specify an object with specific custom naming convention per output.
   * The format of the converter must be a valid `module#method`.
   * You can also use "keep" to keep all GraphQL names as-is.
   * Additionally you can set `transformUnderscore` to `true` if you want to override the default behaviour,
   * which is to preserve underscores.
   *
   * @example Override All Names
   * ```yml
   * config:
   *   namingConvention: change-case#lowerCase
   * ```
   * @example Upper-case enum values
   * ```yml
   * config:
   *   namingConvention: change-case#pascalCase
   * ```
   * @example Keep
   * ```yml
   * config:
   *   namingConvention: keep
   * ```
   * @example Transform Underscores
   * ```yml
   * config:
   *   namingConvention: change-case#pascalCase
   *   transformUnderscore: true
   * ```
   */
  namingConvention?: NamingConvention;
  /**
   * @name namePrefix
   * @type string
   * @default ''
   * @description Adds prefix to the name
   *
   * @example
   * ```yml
   *  generates: src/api/user-service/queries.ts
   *  documents: src/api/user-service/queries.graphql
   *  plugins:
   *    - graphql-codegen-typescript-document-nodes
   *  config:
   *    namePrefix: 'gql'
   * ```
   */
  namePrefix?: string;
  /**
   * @name nameSuffix
   * @type string
   * @default ''
   * @description Adds suffix to the name
   *
   * @example
   * ```yml
   *  generates: src/api/user-service/queries.ts
   *  documents: src/api/user-service/queries.graphql
   *  plugins:
   *    - graphql-codegen-typescript-document-nodes
   *  config:
   *    nameSuffix: 'Query'
   * ```
   */
  nameSuffix?: string;
  transformUnderscore?: boolean;
  fragmentPrefix?: string;
  fragmentSuffix?: string;
}

export const plugin: PluginFunction<TypeScriptDocumentNodesRawPluginConfig> = (schema: GraphQLSchema, documents: Types.DocumentFile[], config: TypeScriptDocumentNodesRawPluginConfig) => {
  const allAst = concatAST(
    documents.reduce((prev, v) => {
      return [...prev, v.content];
    }, [])
  );

  const allFragments: LoadedFragment[] = [
    ...(allAst.definitions.filter(d => d.kind === Kind.FRAGMENT_DEFINITION) as FragmentDefinitionNode[]).map(fragmentDef => ({ node: fragmentDef, name: fragmentDef.name.value, onType: fragmentDef.typeCondition.name.value, isExternal: false })),
    ...(config.externalFragments || []),
  ];

  const visitor = new TypeScriptDocumentNodesVisitor(allFragments, config);
  const visitorResult = visit(allAst, { leave: visitor });

  return [...visitor.getImports(), visitor.fragments, ...visitorResult.definitions.filter(t => typeof t === 'string')].join('\n');
};

export const validate: PluginValidateFn<any> = async (schema: GraphQLSchema, documents: Types.DocumentFile[], config: any, outputFile: string) => {
  if (!outputFile.endsWith('.ts')) {
    throw new Error(`Plugin "typescript-document-nodes" requires extension to be ".ts"!`);
  }
};
