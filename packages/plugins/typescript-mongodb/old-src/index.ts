import { TypeScriptCommonConfig, initCommonTemplate } from 'graphql-codegen-typescript-common';
import { PluginValidateFn, PluginFunction, DocumentFile, toPascalCase } from 'graphql-codegen-core';
import { GraphQLSchema } from 'graphql';
import * as Handlebars from 'handlebars';
import * as index from './templates/index.handlebars';
import * as interfaceTemplate from './templates/interface.handlebars';
import * as type from './templates/type.handlebars';
import * as union from './templates/union.handlebars';
import * as schemaTemplate from './templates/schema.handlebars';
import ifNotRootType from './helpers/if-not-root-type';
import { isPrimitive } from './helpers/is-primitive';
import isArray from './helpers/is-array';
import filterModelFields from './helpers/filter-model-fields';
import { entityFields } from './helpers/entity-fields';
import gql from 'graphql-tag';
import { extname } from 'path';

export interface TypeScriptMongoDbConfig extends TypeScriptCommonConfig {}

export const plugin: PluginFunction<TypeScriptMongoDbConfig> = async (
  schema: GraphQLSchema,
  documents: DocumentFile[],
  config: TypeScriptMongoDbConfig
): Promise<string> => {
  const { templateContext, scalars, convert } = initCommonTemplate(Handlebars, schema, documents, config);
  // KAMIL: I think we don't need to generate enums, scalars, types, unions etc
  // because it's a part of typescript-common
  Handlebars.registerPartial('type', type);
  Handlebars.registerPartial('union', union);
  Handlebars.registerPartial('schema', schemaTemplate);
  Handlebars.registerPartial('interface', interfaceTemplate);

  Handlebars.registerHelper('entityFields', entityFields(convert));
  Handlebars.registerHelper('filterModelFields', filterModelFields);
  Handlebars.registerHelper('ifNotRootType', ifNotRootType);
  Handlebars.registerHelper('isPrimitive', isPrimitive(scalars));
  Handlebars.registerHelper('isArray', isArray);
  Handlebars.registerHelper('toPascalCase', toPascalCase);

  return Handlebars.compile(index)(templateContext);
};

export const DIRECTIVES_NAMES = {
  ID: 'id',
  ENTITY: 'entity',
  ABSTRACT_ENTITY: 'abstractEntity',
  UNION: 'union',
  LINK: 'link',
  COLUMN: 'column',
  EMBEDDED: 'embedded',
  MAP: 'map'
};

export { addToSchema };
export { addToSchema as DIRECTIVES };

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
