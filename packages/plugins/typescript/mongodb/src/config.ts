import { RawConfig } from '@graphql-codegen/visitor-plugin-common';

export interface TypeScriptMongoPluginConfig extends RawConfig {
  /**
   * @default DbObject
   * @description Customize the suffix for the generated GraphQL `type`s.
   *
   * @exampleMarkdown
   * ```yaml
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
   * ```yaml
   * config:
   *   dbInterfaceSuffix: MyInterface
   * ```
   */
  dbInterfaceSuffix?: string;
  /**
   * @default mongodb#ObjectId
   * @description Customize the type of `_id` fields. You can either specify a type name, or specify `module#type`.
   *
   * @exampleMarkdown
   * ```yaml
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
   * ```yaml
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
   * ```yaml
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
   * ```yaml
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
