import { PluginFunction, PluginValidateFn, Types } from '@graphql-codegen/plugin-helpers';
import { convertFactory, NamingConvention } from '@graphql-codegen/visitor-plugin-common';
import { GraphQLSchema, OperationDefinitionNode } from 'graphql';
import gqlTag from 'graphql-tag';

import { print } from 'graphql/language/printer';

export interface TypeScriptDocumentNodesPluginConfig {
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
  /**
   * @name noGraphQLTag
   * @type boolean
   * @default false
   * @description Instead of adding gql tag with the GraphQL operation, it uses
   * the precompiled JSON representation (DocumentNode) of the operation.
   *
   * @example
   * ```yml
   * config:
   *   noGraphQLTag: true
   * ```
   */
  noGraphQLTag?: boolean;
  transformUnderscore?: boolean;
}

function _gql(node: OperationDefinitionNode, noGraphQLTag = false): string {
  if (noGraphQLTag) {
    const nodeWithoutLoc = { ...node };
    if (nodeWithoutLoc.loc) {
      delete nodeWithoutLoc.loc;
    }
    return JSON.stringify(nodeWithoutLoc, undefined, 2);
  } else {
    const code = print(node)
      .replace(/^/gm, '  ')
      .replace(/\s*$/, '');
    return ['gql`', code, '`'].join('\n');
  }
}

export const plugin: PluginFunction<TypeScriptDocumentNodesPluginConfig> = (schema: GraphQLSchema, documents: Types.DocumentFile[], config: TypeScriptDocumentNodesPluginConfig): string => {
  const { namingConvention, namePrefix = '', nameSuffix = '', noGraphQLTag = false, transformUnderscore = false } = config;
  const convertFn = convertFactory({ namingConvention });
  const content = documents
    .filter(documentFile => documentFile.filePath.length > 0)
    .map(documentFile =>
      documentFile.content.definitions
        .filter((d: OperationDefinitionNode) => d.name && d.name.value)
        .map((d: OperationDefinitionNode) => {
          const name = convertFn(namePrefix + d.name.value + nameSuffix, { transformUnderscore });
          return 'export const ' + name + ': DocumentNode = ' + _gql(d, noGraphQLTag) + ';\n';
        })
        .join('\n')
    )
    .join('\n');

  const prepend: string[] = [];

  if (content) {
    prepend.push(`import { DocumentNode } from 'graphql';`);
    if (!noGraphQLTag) {
      prepend.push(`import gql from 'graphql-tag';`);
    }
    prepend.push('', '');
  }

  return prepend.join('\n') + content;
};

export const validate: PluginValidateFn<any> = async (schema: GraphQLSchema, documents: Types.DocumentFile[], config: any, outputFile: string) => {
  if (!outputFile.endsWith('.ts')) {
    throw new Error(`Plugin "typescript-document-nodes" requires extension to be ".ts"!`);
  }
};
