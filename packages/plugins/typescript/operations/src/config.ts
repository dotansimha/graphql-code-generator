import { RawDocumentsConfig, AvoidOptionalsConfig } from '@graphql-codegen/visitor-plugin-common';

export interface TypeScriptDocumentsPluginConfig extends RawDocumentsConfig {
  /**
   * @name avoidOptionals
   * @type boolean
   * @description This will cause the generator to avoid using TypeScript optionals (`?`) on types,
   * so the following definition: `type A { myField: String }` will output `myField: Maybe<string>`
   * instead of `myField?: Maybe<string>`.
   * @default false
   *
   * @example Override all definition types
   * ```yml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - typescript
   *    - typescript-operations
   *  config:
   *    avoidOptionals: true
   * ```
   *
   * @example Override only specific definition types
   * ```yml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - typescript
   *  config:
   *    avoidOptionals:
   *      field: true
   *      inputValue: true
   *      object: true
   * ```
   */
  avoidOptionals?: boolean | AvoidOptionalsConfig;
  /**
   * @name immutableTypes
   * @type boolean
   * @description Generates immutable types by adding `readonly` to properties and uses `ReadonlyArray`.
   * @default false
   *
   * @example
   * ```yml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - typescript
   *    - typescript-operations
   *  config:
   *    immutableTypes: true
   * ```
   */
  immutableTypes?: boolean;
  /**
   * @name flattenGeneratedTypes
   * @type boolean
   * @description Flatten fragment spread and inline fragments into a simple selection set before generating.
   * @default false
   *
   * @example
   * ```yml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - typescript
   *    - typescript-operations
   *  config:
   *    flattenGeneratedTypes: true
   * ```
   */
  flattenGeneratedTypes?: boolean;
  /**
   * @name noExport
   * @type boolean
   * @description Set the to `true` in order to generate output without `export` modifier.
   * This is useful if you are generating `.d.ts` file and want it to be globally available.
   * @default false
   *
   * @example Disable all export from a file
   * ```yml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - typescript
   *  config:
   *    noExport: true
   * ```
   */
  noExport?: boolean;
  globalNamespace?: boolean;
    /**
   * @name addOperationExport
   * @type boolean
   * @description Add const export of the operation name to output file. Pay attention that the file should be `d.ts`. 
   * You can combine it with  `near-operation-file preset` and therefore the generated types will be generate along with graphql file. Then you need to set extension in `presetConfig` to be `.gql.d.ts` and by that you can import gql file in ts files. It will allow you to get everything with one import: ```import { GetClient, GetClientQuery, GetClientQueryVariables, } from "./GetClient.gql";```.
   * @default false
   * @see https://github.com/dotansimha/graphql-code-generator/issues/3949
   *
   * @example
   * ```yml
   * generates:
   * ./typings/api.ts:
   *   plugins:
   *     - '@graphql-codegen/typescript'
   * ./:
   *   preset: near-operation-file
   *   presetConfig:
   *     baseTypesPath: ./typings/api.ts
   *     extension: .gql.d.ts
   *   plugins:
   *     - '@graphql-codegen/typescript-operations'
   *   config:
   *     addOperationExport: true
```
   */
  addOperationExport?: boolean;
}
