import { RawConfig } from '@graphql-codegen/visitor-plugin-common';

export interface TypeScriptMongoPluginConfig extends RawConfig {
  /**
   * @default DbObject
   * @description Customize the suffix for the generated GraphQL `type`s.
   *
   * @exampleMarkdown
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file.ts': {
   *        // plugins...
   *        config: {
   *          dbTypeSuffix: 'MyType'
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  dbTypeSuffix?: string;
  /**
   * @default DbObject
   * @description Customize the suffix for the generated GraphQL `interface`s.
   *
   * @exampleMarkdown
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file.ts': {
   *        // plugins...
   *        config: {
   *          dbInterfaceSuffix: 'MyInterface'
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  dbInterfaceSuffix?: string;
  /**
   * @default mongodb#ObjectId
   * @description Customize the type of `_id` fields. You can either specify a type name, or specify `module#type`.
   *
   * @exampleMarkdown
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file.ts': {
   *        // plugins...
   *        config: {
   *          objectIdType: './my-models.ts#MyIdType'
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  objectIdType?: string;
  /**
   * @default _id
   * @description Customize the name of the id field generated after using `@id` directive over a GraphQL field.
   *
   * @exampleMarkdown
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file.ts': {
   *        // plugins...
   *        config: {
   *          idFieldName: 'id'
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  idFieldName?: string;
  /**
   * @default true
   * @description Replaces generated `enum` values with `string`.
   *
   * @exampleMarkdown
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file.ts': {
   *        // plugins...
   *        config: {
   *          enumsAsString: false
   *        },
   *      },
   *    },
   *  };
   *  export default config;
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
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file.ts': {
   *        // plugins...
   *        config: {
   *          avoidOptionals: true
   *        },
   *      },
   *    },
   *  };
   *  export default config;
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
