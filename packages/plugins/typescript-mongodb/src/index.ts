import { TypeScriptCommonConfig, initCommonTemplate } from 'graphql-codegen-typescript-common';
import { PluginFunction, DocumentFile, schemaToTemplateContext } from 'graphql-codegen-core';
import { GraphQLSchema } from 'graphql';
import * as Handlebars from 'handlebars';
import * as enumTemplate from './templates/enum.handlebars';
import * as index from './templates/index.handlebars';
import * as inputType from './templates/inputType.handlebars';
import * as interfaceTemplate from './templates/interface.handlebars';
import * as scalar from './templates/scalar.handlebars';
import * as type from './templates/type.handlebars';
import * as union from './templates/union.handlebars';
import * as schemaTemplate from './templates/schema.handlebars';
import ifNotRootType from './helpers/if-not-root-type';
import { isPrimitive } from './helpers/is-primitive';
import isArray from './helpers/is-array';
import filterModelFields from './helpers/filter-model-fields';
import { entityFields } from './helpers/entity-fields';

export interface TypeScriptMongoDbConfig extends TypeScriptCommonConfig {}

export const plugin: PluginFunction<TypeScriptMongoDbConfig> = async (
  schema: GraphQLSchema,
  documents: DocumentFile[],
  config: TypeScriptMongoDbConfig
): Promise<string> => {
  const { templateContext, scalars } = initCommonTemplate(Handlebars, schema, config);
  Handlebars.registerPartial('enum', enumTemplate);
  Handlebars.registerPartial('scalar', scalar);
  Handlebars.registerPartial('type', type);
  Handlebars.registerPartial('union', union);
  Handlebars.registerPartial('schema', schemaTemplate);
  Handlebars.registerPartial('inputType', inputType);
  Handlebars.registerPartial('interface', interfaceTemplate);

  Handlebars.registerHelper('entityFields', entityFields);
  Handlebars.registerHelper('filterModelFields', filterModelFields);
  Handlebars.registerHelper('ifNotRootType', ifNotRootType);
  Handlebars.registerHelper('isPrimitive', isPrimitive(scalars));
  Handlebars.registerHelper('isArray', isArray);

  return Handlebars.compile(index)(templateContext);
};
