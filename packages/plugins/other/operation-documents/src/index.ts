import { DocumentNode, GraphQLSchema, Kind, OperationDefinitionNode, print } from 'graphql';
import { PluginFunction, PluginValidateFn, Types } from '@graphql-codegen/plugin-helpers';
import { OperationDocumentsConfig } from './config';
import { getRootTypeMap, buildOperationNodeForField } from '@graphql-tools/utils';

export const plugin: PluginFunction<OperationDocumentsConfig> = async (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: OperationDocumentsConfig
): Promise<Types.PluginOutput> => {
  const rootTypeMap = getRootTypeMap(schema);
  const definitions: OperationDefinitionNode[] = [];
  for (const [kind, rootType] of rootTypeMap) {
    for (const field in rootType.getFields()) {
      const operationDefinitionNode: OperationDefinitionNode = buildOperationNodeForField({
        schema,
        kind,
        field,
        depthLimit: config.depthLimit,
        circularReferenceDepth: config.circularReferenceDepth,
      });
      definitions.push(operationDefinitionNode);
    }
  }
  const document: DocumentNode = {
    kind: Kind.DOCUMENT,
    definitions,
  };
  const content = print(document);
  return {
    content,
  };
};

export const validate: PluginValidateFn<OperationDocumentsConfig> = async (
  _schema: GraphQLSchema,
  _documents: Types.DocumentFile[],
  config: OperationDocumentsConfig,
  outputFile: string
) => {
  if (!outputFile.endsWith('.graphql')) {
    throw new Error(`Plugin "operation-documents" requires extension to be '.graphql' !`);
  }
};

export default { plugin, validate };
