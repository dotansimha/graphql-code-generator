import {
  Types,
  PluginFunction,
  PluginValidateFn,
  getCachedDocumentNodeFromSchema,
  oldVisit,
} from '@graphql-codegen/plugin-helpers';
import { GraphQLSchema } from 'graphql';
import { extname } from 'path';
import gql from 'graphql-tag';
import { TsMongoVisitor } from './visitor.js';
import { TypeScriptMongoPluginConfig, Directives } from './config.js';

export const plugin: PluginFunction<TypeScriptMongoPluginConfig> = (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: TypeScriptMongoPluginConfig
) => {
  const visitor = new TsMongoVisitor(schema, config);
  const astNode = getCachedDocumentNodeFromSchema(schema);
  const visitorResult = oldVisit(astNode, { leave: visitor });
  const header = visitor.objectIdImport;

  return [header, ...visitorResult.definitions.filter(d => typeof d === 'string')].join('\n');
};

export const DIRECTIVES = gql`
  directive @${Directives.UNION}(discriminatorField: String, additionalFields: [AdditionalEntityFields]) on UNION
  directive @${Directives.ABSTRACT_ENTITY}(discriminatorField: String!, additionalFields: [AdditionalEntityFields]) on INTERFACE
  directive @${Directives.ENTITY}(embedded: Boolean, additionalFields: [AdditionalEntityFields]) on OBJECT
  directive @${Directives.COLUMN}(overrideType: String) on FIELD_DEFINITION
  directive @${Directives.ID} on FIELD_DEFINITION
  directive @${Directives.LINK}(overrideType: String) on FIELD_DEFINITION
  directive @${Directives.EMBEDDED} on FIELD_DEFINITION
  directive @${Directives.MAP}(path: String!) on FIELD_DEFINITION
  # Inputs
  input AdditionalEntityFields {
    path: String
    type: String
  }
`;

export const addToSchema = DIRECTIVES;

export const validate: PluginValidateFn<any> = async (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: any,
  outputFile: string
) => {
  if (extname(outputFile) !== '.ts' && extname(outputFile) !== '.tsx') {
    throw new Error(`Plugin "typescript-mongodb" requires extension to be ".ts" or ".tsx"!`);
  }
};
