import { RawTypesConfig } from '@graphql-codegen/visitor-plugin-common';
import { AvoidOptionalsConfig } from './types';

export interface TypeScriptPluginConfig extends RawTypesConfig {
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
   *      inputValue: true
   *      object: true
   * ```
   */
  avoidOptionals?: boolean | AvoidOptionalsConfig;
  /**
   * @name constEnums
   * @type boolean
   * @description Will prefix every generated `enum` with `const`, you can read more
   * about const enums {@link https://www.typescriptlang.org/docs/handbook/enums.html|here}.
   * @default false
   *
   * @example
   * ```yml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - typescript
   *  config:
   *    constEnums: true
   * ```
   */
  constEnums?: boolean;
  /**
   * @name enumsAsTypes
   * @type boolean
   * @description Generates enum as TypeScript `type` instead of `enum`. Useful it you wish to genereate `.d.ts` declartion file instead of `.ts`
   * @default false
   *
   * @example
   * ```yml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - typescript
   *  config:
   *    enumsAsTypes: true
   * ```
   */
  enumsAsTypes?: boolean;
  /**
   * @name enumsAsConst
   * @type boolean
   * @description Generates enum as TypeScript `const assertions` instead of `enum`. This can even be used to enable enum-like patterns in plain JavaScript code if you choose not to use TypeScript’s enum construct.
   * @default false
   *
   * @example
   * ```yml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - typescript
   *  config:
   *    enumsAsConst: true
   * ```
   */
  enumsAsConst?: boolean;
  /**
   * @name fieldWrapperValue
   * @type string
   * @description Allow to override the type value of `FieldWrapper`.
   * @default T | Promise<T> | (() => T | Promise<T>)
   *
   * @example Only allow values
   * ```yml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - typescript
   *  config:
   *    fieldWrapperValue: T
   * ```
   */
  fieldWrapperValue?: string;
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
   *  config:
   *    immutableTypes: true
   * ```
   */
  immutableTypes?: boolean;
  /**
   * @name maybeValue
   * @type string
   * @description Allow to override the type value of `Maybe`.
   * @default T | null
   *
   * @example Allow undefined
   * ```yml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - typescript
   *  config:
   *    maybeValue: T | null | undefined
   * ```
   */
  maybeValue?: string;
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
  /**
   * @name wrapFieldDefinitions
   * @type boolean
   * @description Set the to `true` in order to wrap field definitions with `FieldWrapper`.
   * This is useful to allow return types such as Promises and functions.
   * @default true
   *
   * @example Enable wrapping fields
   * ```yml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - typescript
   *  config:
   *    wrapFieldDefinitions: false
   * ```
   */
  wrapFieldDefinitions?: boolean;
}
