import { RawConfig } from '@graphql-codegen/visitor-plugin-common';

export interface TypeScriptMongoPluginConfig extends RawConfig {
  /**
   * @name dbTypeSuffix
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
