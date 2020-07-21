import { Types, PluginValidateFn, PluginFunction } from '@graphql-codegen/plugin-helpers';
import { parse, GraphQLSchema, OperationDefinitionNode } from 'graphql';
import { pascalCase } from 'change-case';
import { extname } from 'path';

export const plugin: PluginFunction<{}> = (schema: GraphQLSchema, documents: Types.DocumentFile[], config) => {
  return {
    prepend: [`import { TypedDocumentNode } from '@graphql-typed-document-node/core';`],
    content: documents
      .map(docFile => {
        const operation = docFile.document.definitions[0] as OperationDefinitionNode;
        const resultTypeName = pascalCase(operation.name.value) + pascalCase(operation.operation);
        const variablesTypeName = pascalCase(operation.name.value) + pascalCase(operation.operation) + 'Variables';

        return `export const ${operation.name.value}${pascalCase(
          operation.operation
        )}: TypedDocumentNode<${resultTypeName}, ${variablesTypeName}> = ${JSON.stringify(
          parse(docFile.rawSDL, { noLocation: true })
        )};`;
      })
      .join('\n'),
  };
};

export const validate: PluginValidateFn<any> = async (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config,
  outputFile: string
) => {
  if (extname(outputFile) !== '.ts' && extname(outputFile) !== '.tsx') {
    throw new Error(`Plugin "typed-document-node" requires extension to be ".ts" or ".tsx"!`);
  }
};
