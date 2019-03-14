import { RawConfig } from 'graphql-codegen-visitor-plugin-common';
import { DocumentFile, PluginFunction, PluginValidateFn } from 'graphql-codegen-plugin-helpers';
import { parse, visit, GraphQLSchema } from 'graphql';
import { printSchemaWithDirectives } from 'graphql-toolkit';
import { extname } from 'path';
import gql from 'graphql-tag';
import { TsMongoVisitor } from './visitor';

export interface TypeScriptMongoPluginConfig extends RawConfig {
  dbTypeSuffix?: string;
  dbInterfaceSuffix?: string;
  objectIdType?: string;
  idFieldName?: string;
  enumsAsString?: boolean;
  avoidOptionals?: boolean;
}

export const plugin: PluginFunction<TypeScriptMongoPluginConfig> = (
  schema: GraphQLSchema,
  documents: DocumentFile[],
  config: TypeScriptMongoPluginConfig
) => {
  const visitor = new TsMongoVisitor(schema, config);
  const printedSchema = printSchemaWithDirectives(schema);
  const astNode = parse(printedSchema);
  const visitorResult = visit(astNode, { leave: visitor as any });
  const header = visitor.objectIdImport;

  return [header, ...visitorResult.definitions.filter(d => typeof d === 'string')].join('\n');
};

export enum Directives {
  ID = 'id',
  ENTITY = 'entity',
  ABSTRACT_ENTITY = 'abstractEntity',
  UNION = 'union',
  LINK = 'link',
  COLUMN = 'column',
  EMBEDDED = 'embedded',
  MAP = 'map'
}

export const addToSchema = gql`
  directive @${Directives.UNION}(discriminatorField: String, additionalFields: [AdditionalEntityFields]) on UNION
  directive @${
    Directives.ABSTRACT_ENTITY
  }(discriminatorField: String!, additionalFields: [AdditionalEntityFields]) on INTERFACE
  directive @${Directives.ENTITY}(embedded: Boolean, additionalFields: [AdditionalEntityFields]) on OBJECT
  directive @${Directives.COLUMN}(overrideType: String) on FIELD_DEFINITION
  directive @${Directives.ID} on FIELD_DEFINITION
  directive @${Directives.LINK} on FIELD_DEFINITION
  directive @${Directives.EMBEDDED} on FIELD_DEFINITION
  directive @${Directives.MAP}(path: String!) on FIELD_DEFINITION
  # Inputs
  input AdditionalEntityFields {
    path: String
    type: String
  }
`;

export const validate: PluginValidateFn<any> = async (
  schema: GraphQLSchema,
  documents: DocumentFile[],
  config: any,
  outputFile: string
) => {
  if (extname(outputFile) !== '.ts') {
    throw new Error(`Plugin "typescript-mongodb" requires extension to be ".ts"!`);
  }
};
