import { TypeScriptPluginConfig } from 'graphql-codegen-typescript';
import { DocumentFile, PluginFunction, PluginValidateFn } from 'graphql-codegen-core';
import { parse, visit, GraphQLSchema } from 'graphql';
import { printSchemaWithDirectives } from 'graphql-toolkit';
import { TsMongoVisitor } from './visitor';
import { extname } from 'path';
import gql from 'graphql-tag';

export interface TypeScriptPluginConfig extends TypeScriptPluginConfig {
  dbTypeSuffix?: string;
  dbInterfaceSuffix?: string;
  objectIdType?: string;
  idFieldName?: string;
  enumsAsString?: boolean;
}

export const plugin: PluginFunction<TypeScriptPluginConfig> = (
  schema: GraphQLSchema,
  documents: DocumentFile[],
  config: TypeScriptPluginConfig
) => {
  const visitor = new TsMongoVisitor(schema, config) as any;
  const printedSchema = printSchemaWithDirectives(schema);
  const astNode = parse(printedSchema);
  const header = `type Maybe<T> = ${visitor.config.maybeValue};`;
  const visitorResult = visit(astNode, { leave: visitor });

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
  directive @${Directives.UNION}(discriminatorField: String) on UNION
  directive @${Directives.ABSTRACT_ENTITY}(discriminatorField: String!) on INTERFACE
  directive @${Directives.ENTITY}(embedded: Boolean, additionalFields: [AdditionalEntityFields]) on OBJECT
  directive @${Directives.COLUMN}(name: String, overrideType: String, overrideIsArray: Boolean) on FIELD_DEFINITION
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
