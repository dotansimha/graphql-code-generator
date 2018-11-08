import { TypeScriptCommonConfig, initCommonTemplate } from 'graphql-codegen-typescript-common';
import { PluginFunction, DocumentFile, toPascalCase } from 'graphql-codegen-core';
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
import gql from 'graphql-tag';

export interface TypeScriptMongoDbConfig extends TypeScriptCommonConfig {}

export const plugin: PluginFunction<TypeScriptMongoDbConfig> = async (
  schema: GraphQLSchema,
  documents: DocumentFile[],
  config: TypeScriptMongoDbConfig
): Promise<string> => {
  const { templateContext, scalars, convert } = initCommonTemplate(Handlebars, schema, config);
  Handlebars.registerPartial('enum', enumTemplate);
  Handlebars.registerPartial('scalar', scalar);
  Handlebars.registerPartial('type', type);
  Handlebars.registerPartial('union', union);
  Handlebars.registerPartial('schema', schemaTemplate);
  Handlebars.registerPartial('inputType', inputType);
  Handlebars.registerPartial('interface', interfaceTemplate);

  Handlebars.registerHelper('entityFields', entityFields(convert));
  Handlebars.registerHelper('filterModelFields', filterModelFields);
  Handlebars.registerHelper('ifNotRootType', ifNotRootType);
  Handlebars.registerHelper('isPrimitive', isPrimitive(scalars));
  Handlebars.registerHelper('isArray', isArray);
  Handlebars.registerHelper('toPascalCase', toPascalCase);

  return Handlebars.compile(index)(templateContext);
};

const addToSchema = gql`
  directive @union(discriminatorField: String) on UNION
  directive @abstractEntity(discriminatorField: String!) on INTERFACE
  directive @entity(embedded: Boolean, additionalFields: [AdditionalEntityFields]) on OBJECT
  directive @column(name: String, overrideType: String, overrideIsArray: Boolean) on FIELD_DEFINITION
  directive @id on FIELD_DEFINITION
  directive @link on FIELD_DEFINITION
  directive @embedded on FIELD_DEFINITION
  directive @map(path: String!) on FIELD_DEFINITION
  # Inputs
  input AdditionalEntityFields {
    path: String
    type: String
  }
`;

export { addToSchema };
export { addToSchema as DIRECTIVES };
