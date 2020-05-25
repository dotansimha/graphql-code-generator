import { PluginFunction, PluginValidateFn, Types } from '@graphql-codegen/plugin-helpers';
import {
  NamingConvention,
  LoadedFragment,
  RawClientSideBasePluginConfig,
} from '@graphql-codegen/visitor-plugin-common';
import { GraphQLSchema, visit, concatAST, FragmentDefinitionNode, Kind } from 'graphql';
import { TypeScriptDocumentNodesVisitor } from './visitor';

/**
 * @description This plugin generates TypeScript source (`.ts`) file from GraphQL files (`.graphql`).
 */
export interface TypeScriptDocumentNodesRawPluginConfig extends RawClientSideBasePluginConfig {
  /**
   * @default pascal-case#pascalCase
   * @description Allow you to override the naming convention of the output.
   * You can either override all namings, or specify an object with specific custom naming convention per output.
   * The format of the converter must be a valid `module#method`.
   * Allowed values for specific output are: `typeNames`, `enumValues`.
   * You can also use "keep" to keep all GraphQL names as-is.
   * Additionally you can set `transformUnderscore` to `true` if you want to override the default behavior,
   * which is to preserves underscores.
   *
   * @examples
   * ## Override All Names
   * ```yml
   * config:
   *   namingConvention: lower-case#lowerCase
   * ```
   *
   * ## Upper-case enum values
   * ```yml
   * config:
   *   namingConvention:
   *     typeNames: pascal-case#pascalCase
   *     enumValues: upper-case#upperCase
   * ```
   *
   * ## Keep name as-is
   * ```yml
   * config:
   *   namingConvention: keep
   * ```
   *
   * ## Remove Underscores
   * ```yml
   * config:
   *   namingConvention:
   *     typeNames: pascal-case#pascalCase
   *     transformUnderscore: true
   * ```
   */
  namingConvention?: NamingConvention;
  /**
   * @default ""
   * @description Adds prefix to the name
   *
   * @examples
   * ```yml
   *  documents: src/api/user-service/queries.graphql
   *  generates:
   *    src/api/user-service/queries.ts:
   *    plugins:
   *      - typescript-document-nodes
   *    config:
   *      namePrefix: 'gql'
   * ```
   */
  namePrefix?: string;
  /**
   * @default ""
   * @description Adds suffix to the name
   *
   * @examples
   * ```yml
   *  documents: src/api/user-service/queries.graphql
   *  generates:
   *    src/api/user-service/queries.ts:
   *    plugins:
   *      - typescript-document-nodes
   *    config:
   *      nameSuffix: 'Query'
   * ```
   */
  nameSuffix?: string;
  /**
   * @default ""
   * @description Adds prefix to the fragment variable
   */
  fragmentPrefix?: string;
  /**
   * @default ""
   * @description Adds suffix to the fragment variable
   */
  fragmentSuffix?: string;
}

export const plugin: PluginFunction<TypeScriptDocumentNodesRawPluginConfig> = (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: TypeScriptDocumentNodesRawPluginConfig
) => {
  const allAst = concatAST(documents.map(v => v.document));

  const allFragments: LoadedFragment[] = [
    ...(allAst.definitions.filter(d => d.kind === Kind.FRAGMENT_DEFINITION) as FragmentDefinitionNode[]).map(
      fragmentDef => ({
        node: fragmentDef,
        name: fragmentDef.name.value,
        onType: fragmentDef.typeCondition.name.value,
        isExternal: false,
      })
    ),
    ...(config.externalFragments || []),
  ];

  const visitor = new TypeScriptDocumentNodesVisitor(schema, allFragments, config, documents);
  const visitorResult = visit(allAst, { leave: visitor });

  return {
    prepend: visitor.getImports(),
    content: [visitor.fragments, ...visitorResult.definitions.filter(t => typeof t === 'string')].join('\n'),
  };
};

export const validate: PluginValidateFn<any> = async (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: any,
  outputFile: string
) => {
  if (!outputFile.endsWith('.ts')) {
    throw new Error(`Plugin "typescript-document-nodes" requires extension to be ".ts"!`);
  }
};
