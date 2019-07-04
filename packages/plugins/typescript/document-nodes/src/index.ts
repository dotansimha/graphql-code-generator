import { PluginFunction, PluginValidateFn, Types } from '@graphql-codegen/plugin-helpers';
import { GraphQLSchema, OperationDefinitionNode } from 'graphql';
import { print } from 'graphql/language/printer';
import * as changeCase from 'change-case';

export type NamingConvention = 'lowerCamelCase' | 'UpperCamelCase' | 'UPPER_CASE';

function useNamingConvention(str: string, namingConvention?: NamingConvention): string {
  if (namingConvention === 'lowerCamelCase') {
    return changeCase.camelCase(str);
  } else if (namingConvention === 'UpperCamelCase') {
    return changeCase.upperCaseFirst(changeCase.camelCase(str));
  } else if (namingConvention === 'UPPER_CASE') {
    return changeCase.upperCase(changeCase.snakeCase(str));
  } else {
    return str;
  }
}

export interface TypeScriptDocumentNodesPluginConfig {
  /**
   * @name namingConvention
   * @type string
   * @default false
   * @description Generates variable names in choosen naming convention
   * (lowerCamelCase, UpperCamelCase or UPPER_CASE)
   *
   * @example
   * ```yml
   *  generates: src/api/user-service/queries.ts
   *  documents: src/api/user-service/queries.graphql
   *  plugins:
   *    - graphql-codegen-typescript-document-nodes
   *  config:
   *    namingConvention: lowerCamelCase
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
}

export const plugin: PluginFunction<TypeScriptDocumentNodesPluginConfig> = (schema: GraphQLSchema, documents: Types.DocumentFile[], config: TypeScriptDocumentNodesPluginConfig): string => {
  const { namingConvention, namePrefix = '', nameSuffix = '' } = config;
  const content = documents
    .filter(documentFile => documentFile.filePath.length > 0)
    .map(documentFile =>
      documentFile.content.definitions
        .filter((d: OperationDefinitionNode) => d.name && d.name.value)
        .map((d: OperationDefinitionNode) => {
          const name = useNamingConvention(namePrefix + d.name.value + nameSuffix, namingConvention);
          const code = print(d)
            .replace(/^/gm, '  ')
            .replace(/\s*$/, '');
          return ['export const ' + name + ': DocumentNode = gql`', code, '`;', ''].join('\n');
        })
        .join('\n')
    )
    .join('\n');

  const prepend = content ? [`import { DocumentNode } from 'graphql';`, `import gql from 'graphql-tag';`, '', ''] : [];

  return prepend.join('\n') + content;
};

export const validate: PluginValidateFn<any> = async (schema: GraphQLSchema, documents: Types.DocumentFile[], config: any, outputFile: string) => {
  if (!outputFile.endsWith('.ts')) {
    throw new Error(`Plugin "typescript-document-nodes" requires extension to be ".ts"!`);
  }
};
