import {
  type ConvertSchemaEnumToDeclarationBlockString,
  type EnumValuesMap,
  RawDocumentsConfig,
} from '@graphql-codegen/visitor-plugin-common';
import type { AvoidOptionalsConfig } from './config.avoidOptionals';

/**
 * @description This plugin generates TypeScript types based on your GraphQLSchema _and_ your GraphQL operations and fragments.
 * It generates types for your GraphQL documents: Query, Mutation, Subscription and Fragment.
 */
export interface TypeScriptDocumentsPluginConfig extends RawDocumentsConfig {
  /**
   * @description The [GraphQL spec](https://spec.graphql.org/draft/#sel-FAHjBJFCAACE_Gh7d)
   * allows arrays and a single primitive value for list input. This allows to
   * deactivate that behavior to only accept arrays instead of single values. If
   * set to `false`, the definition: `query foo(bar: [Int!]!): Foo` will output
   * `bar: Array<Int>` instead of `bar: Array<Int> | Int` for the variable part.
   * @default true
   *
   * @exampleMarkdown
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file.ts': {
   *        plugins: ['typescript-operations'],
   *        config: {
   *          arrayInputCoercion: false
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  arrayInputCoercion?: boolean;
  /**
   * @description This will cause the generator to avoid using TypeScript optionals (`?`) on types,
   * so the following definition: `type A { myField: String }` will output `myField: Maybe<string>`
   * instead of `myField?: Maybe<string>`.
   * @default false
   *
   * @exampleMarkdown
   * ## Override all definition types
   *
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file.ts': {
   *        plugins: ['typescript-operations'],
   *        config: {
   *          avoidOptionals: true
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   *
   * ## Override only specific definition types
   *
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file.ts': {
   *        plugins: ['typescript-operations'],
   *        config: {
   *          avoidOptionals: {
   *            variableValue: true,
   *            inputValue: true,
   *            defaultValue: true,
   *          }
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  avoidOptionals?: boolean | AvoidOptionalsConfig;
  /**
   * @description Generates immutable types by adding `readonly` to properties and uses `ReadonlyArray`.
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
   *        plugins: ['typescript-operations'],
   *        config: {
   *          immutableTypes: true
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  immutableTypes?: boolean;
  /**
   * @description Flatten fragment spread and inline fragments into a simple selection set before generating.
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
   *        plugins: ['typescript-operations'],
   *        config: {
   *          flattenGeneratedTypes: true
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  flattenGeneratedTypes?: boolean;

  /**
   * @description Include all fragments types when flattenGeneratedTypes is enabled.
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
   *        plugins: ['typescript-operations'],
   *        config: {
   *          flattenGeneratedTypes: true,
   *          flattenGeneratedTypesIncludeFragments: true
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  flattenGeneratedTypesIncludeFragments?: boolean;

  /**
   * @description Set to `true` in order to generate output without `export` modifier.
   * This is useful if you are generating `.d.ts` file and want it to be globally available.
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
   *        plugins: ['typescript-operations'],
   *        config: {
   *          noExport: true
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  noExport?: boolean;
  /**
   * @name addOperationExport
   * @type boolean
   * @description Add const export of the operation name to output file. Pay attention that the file should be `d.ts`.
   * You can combine it with `near-operation-file preset` and therefore the types will be generated along with graphql file. Then you need to set extension in `presetConfig` to be `.gql.d.ts` and by that you can import `gql` file in `ts` files.
   * It will allow you to get everything with one import:
   *
   * ```ts
   * import { GetClient, GetClientQuery, GetClientQueryVariables } from './GetClient.gql.js'
   * ```
   * @default false
   * @see https://github.com/dotansimha/graphql-code-generator/issues/3949
   *
   * @exampleMarkdown
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      "./": {
   *        "preset": "near-operation-file",
   *        "presetConfig": {
   *          "baseTypesPath": "./typings/api.ts",
   *          "extension": ".gql.d.ts"
   *        },
   *        "plugins": [
   *          "typescript-operations"
   *        ],
   *        "config": {
   *          "addOperationExport": true
   *        }
   *      }
   *    }
   *  };
   *  export default config;
   * ```
   */
  addOperationExport?: boolean;
  /**
   * @description Allows overriding the type value of nullable fields to match GraphQL client's runtime behaviour.
   * @default T | null
   *
   * @exampleMarkdown
   * ## Allow undefined
   * By default, a GraphQL server will return either the expected type or `null` for a nullable field.
   * `maybeValue` option could be used to change this behaviour if your GraphQL client does something different such as returning `undefined`.
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file.ts': {
   *        plugins: ['typescript-operations'],
   *        config: {
   *          maybeValue: 'T | null | undefined'
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  maybeValue?: string;

  /**
   * @description Allows overriding the type of Input and Variables nullable types.
   * @default T | null | undefined
   *
   * @exampleMarkdown
   * ## Disallow `undefined`
   * Disallowing `undefined` is useful if you want to force explicit null to be passed in as Variables to the server. Use `inputMaybeValue: 'T | null'` with `avoidOptionals.inputValue: true` to achieve this.
   *
   * ```ts filename="codegen.ts"
   * import type { CodegenConfig } from '@graphql-codegen/cli'
   *
   * const config: CodegenConfig = {
   *   // ...
   *   generates: {
   *     'path/to/file.ts': {
   *       plugins: ['typescript-operations'],
   *       config: {
   *         avoidOptionals: {
   *           inputValue: true,
   *         },
   *         inputMaybeValue: 'T | null'
   *       }
   *     }
   *   }
   * }
   * export default config
   * ```
   */
  inputMaybeValue?: string;

  /**
   * @description Adds undefined as a possible type for query variables
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
   *        plugins: ['typescript-operations'],
   *        config: {
   *          allowUndefinedQueryVariables: true
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */

  allowUndefinedQueryVariables?: boolean;

  /**
   * @description Options related to handling nullability
   * @exampleMarkdown
   * ## `errorHandlingClient`
   * An error handling client is a client which prevents the user from reading a `null` used as a placeholder for an error in a GraphQL response.
   * The client may do so by throwing when an errored field is accessed (as is the case for [`graphql-toe`](https://github.com/graphile/graphql-toe)),
   * or when a fragment containing an error is read (as is the case for Relay's `@throwOnFieldError` directive),
   * or by preventing any data from being read if an error occurred (as with Apollo Client's `errorPolicy: "none"`).
   *
   * When using error handling clients, a semantic non-nullable field can never be `null`.
   * If a semantic non-nullable field's value in the response is `null`, there must be a respective error.
   * The error handling client will throw in this case, so the `null` value is never read.
   *
   * To enable this option, install `graphql-sock` peer dependency:
   *
   * ```sh npm2yarn
   * npm install -D graphql-sock
   * ```
   *
   * Now, you can enable support for error handling clients:
   *
   * ```ts filename="codegen.ts"
   * import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   * const config: CodegenConfig = {
   *   // ...
   *   generates: {
   *     'path/to/file.ts': {
   *       plugins: ['typescript-operations'],
   *       config: {
   *         nullability: {
   *           errorHandlingClient: true
   *         }
   *       },
   *     },
   *   },
   * };
   * export default config;
   * ```
   */
  nullability?: {
    errorHandlingClient: boolean;
  };

  /**
   * @description Controls the enum output type. Options: `string-literal` | `native-numeric` | `const` | `native-const` | `native`;
   * @default `string-literal`
   *
   * @exampleMarkdown
   * ```ts filename="codegen.ts"
   * import type { CodegenConfig } from '@graphql-codegen/cli'
   *
   * const config: CodegenConfig = {
   *   // ...
   *   generates: {
   *     'path/to/file.ts': {
   *       plugins: ['typescript-operations'],
   *       config: {
   *         enumType: 'string-literal',
   *       }
   *     }
   *   }
   * }
   * export default config
   */
  enumType?: ConvertSchemaEnumToDeclarationBlockString['outputType'];
  /**
   * @description Overrides the default value of enum values declared in your GraphQL schema.
   * You can also map the entire enum to an external type by providing a string that of `module#type`.
   *
   * @exampleMarkdown
   * ## With Custom Values
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        // plugins...
   *        config: {
   *          enumValues: {
   *            MyEnum: {
   *              A: 'foo'
   *            }
   *          }
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   *
   * ## With External Enum
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        // plugins...
   *        config: {
   *          enumValues: {
   *            MyEnum: './my-file#MyCustomEnum',
   *          }
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   *
   * ## Import All Enums from a file
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        // plugins...
   *        config: {
   *          enumValues: {
   *            MyEnum: './my-file',
   *          }
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  enumValues?: EnumValuesMap;
  /**
   * @description This will cause the generator to ignore enum values defined in GraphQLSchema
   * @default false
   *
   * @exampleMarkdown
   * ## Ignore enum values from schema
   *
   * ```ts filename="codegen.ts"
   *  import type { CodegenConfig } from '@graphql-codegen/cli';
   *
   *  const config: CodegenConfig = {
   *    // ...
   *    generates: {
   *      'path/to/file': {
   *        // plugins...
   *        config: {
   *          ignoreEnumValuesFromSchema: true,
   *        },
   *      },
   *    },
   *  };
   *  export default config;
   * ```
   */
  ignoreEnumValuesFromSchema?: boolean;
  /**
   * @description This option controls whether or not a catch-all entry is added to enum type definitions for values that may be added in the future.
   * This is useful if you are using `relay`.
   * @default false
   *
   * @exampleMarkdown
   * ```ts filename="codegen.ts"
   * import type { CodegenConfig } from '@graphql-codegen/cli'
   *
   * const config: CodegenConfig = {
   *   // ...
   *   generates: {
   *     'path/to/file.ts': {
   *       plugins: ['typescript-operations'],
   *       config: {
   *         futureProofEnums: true
   *       }
   *     }
   *   }
   * }
   * export default config
   * ```
   */
  futureProofEnums?: boolean;
}
