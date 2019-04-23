import { RawConfig } from '@graphql-codegen/visitor-plugin-common';
import { Types, PluginFunction, PluginValidateFn } from '@graphql-codegen/plugin-helpers';
import { parse, visit, GraphQLSchema } from 'graphql';
import { printSchemaWithDirectives } from 'graphql-toolkit';
import { extname } from 'path';
import gql from 'graphql-tag';
import { TsMongoVisitor } from './visitor';

export interface TypeScriptMongoPluginConfig extends RawConfig {
  /**
   * @name dbTypeSuffix
   * @type string
   * @default DbObject
   * @description Customize the suffix for the generated GraphQL `type`s.
   *
   * @example
   * ```yml
   * config:
   *   dbTypeSuffix: MyType
   * ```
   */
  dbTypeSuffix?: string;
  /**
   * @name dbInterfaceSuffix
   * @type string
   * @default DbObject
   * @description Customize the suffix for the generated GraphQL `interface`s.
   *
   * @example
   * ```yml
   * config:
   *   dbInterfaceSuffix: MyInterface
   * ```
   */
  dbInterfaceSuffix?: string;
  /**
   * @name objectIdType
   * @type string
   * @default mongodb#ObjectId
   * @description Customize the type of `_id` fields. You can either specify a type name, or specify `module#type`.
   *
   * @example
   * ```yml
   * config:
   *   objectIdType: ./my-models.ts#MyIdType
   * ```
   */
  objectIdType?: string;
  /**
   * @name idFieldName
   * @type string
   * @default _id
   * @description Customize the name of the id field generated after using `@id` directive over a GraphQL field.
   *
   * @example
   * ```yml
   * config:
   *   idFieldName: id
   * ```
   */
  idFieldName?: string;
  /**
   * @name enumsAsString
   * @type boolean
   * @default true
   * @description Replaces generated `enum` values with `string`.
   *
   * @example
   * ```yml
   * config:
   *   enumsAsString: false
   * ```
   */
  enumsAsString?: boolean;
  /**
   * @name avoidOptionals
   * @type boolean
   * @description This will cause the generator to avoid using TypeScript optionals (`?`),
   * so the following definition: `type A { myField: String }` will output `myField: Maybe<string>`
   * instead of `myField?: Maybe<string>`.
   * @default false
   *
   * @example
   * ```yml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - typescript
   *    - typescript-mongodb
   *  config:
   *    avoidOptionals: true
   * ```
   */
  avoidOptionals?: boolean;
}

export const plugin: PluginFunction<TypeScriptMongoPluginConfig> = (schema: GraphQLSchema, documents: Types.DocumentFile[], config: TypeScriptMongoPluginConfig) => {
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
  MAP = 'map',
}

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

export const validate: PluginValidateFn<any> = async (schema: GraphQLSchema, documents: Types.DocumentFile[], config: any, outputFile: string) => {
  if (extname(outputFile) !== '.ts') {
    throw new Error(`Plugin "typescript-mongodb" requires extension to be ".ts"!`);
  }
};
