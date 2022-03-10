import { RawConfig } from '@graphql-codegen/visitor-plugin-common';

export interface TypeScriptMongoPluginConfig extends RawConfig {
  /**
   * @default DbObject
   * @description Customize the suffix for the generated GraphQL `type`s.
   *
   * @exampleMarkdown
   * ```yml
   * config:
   *   dbTypeSuffix: MyType
   * ```
   */
  dbTypeSuffix?: string;
  /**
   * @default DbObject
   * @description Customize the suffix for the generated GraphQL `interface`s.
   *
   * @exampleMarkdown
   * ```yml
   * config:
   *   dbInterfaceSuffix: MyInterface
   * ```
   */
  dbInterfaceSuffix?: string;
  /**
   * @default DbObject
   * @description: Sets the default suffix for the generated GraphQL when a `@link` directive is used with an `overrideType` value that does not reference a type, interface, or union explicitly defined in the schema.
   *
   * @exampleMarkdown
   * ```yml
   * config:
   *   defaultLinkOverrideTypeSuffix: MySuffix
   * ```
   */
  defaultLinkOverrideTypeSuffix?: string;
  /**
   * @default mongodb#ObjectId
   * @description Customize the type of `_id` fields. You can either specify a type name, or specify `module#type`.
   *
   * @exampleMarkdown
   * ```yml
   * config:
   *   objectIdType: ./my-models.ts#MyIdType
   * ```
   */
  objectIdType?: string;
  /**
   * @default _id
   * @description Customize the name of the id field generated after using `@id` directive over a GraphQL field.
   *
   * @exampleMarkdown
   * ```yml
   * config:
   *   idFieldName: id
   * ```
   */
  idFieldName?: string;
  /**
   * @default true
   * @description Replaces generated `enum` values with `string`.
   *
   * @exampleMarkdown
   * ```yml
   * config:
   *   enumsAsString: false
   * ```
   */
  enumsAsString?: boolean;
  /**
   * @description This will cause the generator to avoid using TypeScript optionals (`?`),
   * so the following definition: `type A { myField: String }` will output `myField: Maybe<string>`
   * instead of `myField?: Maybe<string>`.
   * @default false
   *
   * @exampleMarkdown
   * ```yml
   * generates:
   *   path/to/file.ts:
   *     plugins:
   *       - typescript
   *       - typescript-mongodb
   *     config:
   *       avoidOptionals: true
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
