# @graphql-codegen/visitor-plugin-common

## 2.12.1

### Patch Changes

- [#8189](https://github.com/dotansimha/graphql-code-generator/pull/8189) [`b408f8238`](https://github.com/dotansimha/graphql-code-generator/commit/b408f8238c00bbb4cd448501093856c06cfde50f) Thanks [@n1ru4l](https://github.com/n1ru4l)! - Fix CommonJS TypeScript resolution with `moduleResolution` `node16` or `nodenext`

- [#8185](https://github.com/dotansimha/graphql-code-generator/pull/8185) [`47d0a57e2`](https://github.com/dotansimha/graphql-code-generator/commit/47d0a57e27dd0d2334670bfc6c81c45e00ff4e74) Thanks [@chrisands](https://github.com/chrisands)! - Fix emitLegacyCommonJSImports to being passed

- Updated dependencies [[`b408f8238`](https://github.com/dotansimha/graphql-code-generator/commit/b408f8238c00bbb4cd448501093856c06cfde50f)]:
  - @graphql-codegen/plugin-helpers@2.6.2

## 2.12.0

### Minor Changes

- 2cbcbb371: Add new flag to emit legacy common js imports. Default it will be `true` this way it ensure that generated code works with [non-compliant bundlers](https://github.com/dotansimha/graphql-code-generator/issues/8065).

  You can use the option in your config:

  ```yaml
  schema: 'schema.graphql'
   documents:
     - 'src/**/*.graphql'
   emitLegacyCommonJSImports: true
  ```

  Alternative you can use the CLI to set this option:

  ```bash
  $ codegen --config-file=config.yml --emit-legacy-common-js-imports
  ```

### Patch Changes

- Updated dependencies [2cbcbb371]
  - @graphql-codegen/plugin-helpers@2.6.0

## 2.11.1

### Patch Changes

- 525ad580b: Revert breaking change for Next.js applications that are incapable of resolving an import with a `.js` extension.

## 2.11.0

### Minor Changes

- 68bb30e19: Attach `.js` extension to imports starting with either a `.` or `/` character.
- d84afec09: Support TypeScript ESM modules (`"module": "node16"` and `"moduleResolution": "node16"`).

  [More information on the TypeScript Release Notes.](https://devblogs.microsoft.com/typescript/announcing-typescript-4-7/#ecmascript-module-support-in-node-js)

### Patch Changes

- Updated dependencies [d84afec09]
- Updated dependencies [a4fe5006b]
- Updated dependencies [8e44df58b]
  - @graphql-codegen/plugin-helpers@2.5.0

## 2.10.0

### Minor Changes

- aa1e6eafd: Add @Deprecated support for input

### Patch Changes

- a42fcbfe4: docs: Swapping rootValueType with directiveContextTypes for correctness
- 8b10f22be: Ensure falsy enum values are still mapped

## 2.9.1

### Patch Changes

- d16bebacb: Update @graphql-tools/relay-operation-optimizer package;

  - Previously that package used relay-compiler@12 which has graphql v15 as a peer dependency and it was causing peer dependency warnings if user installs a different version of `graphql` package. Now we forked and released v12 under a different name and removed version range for `graphql` in `peerDependencies` of `relay-compiler`

## 2.9.0

### Minor Changes

- c3d7b7226: support the `@oneOf` directive on input types.

## 2.8.0

### Minor Changes

- f1fb77bd4: feat: Add option to squash exactly similar fragment types

## 2.7.6

### Patch Changes

- 9a5f31cb6: New option `onlyEnums` for Typescript

## 2.7.5

### Patch Changes

- 2966686e9: Generate $fragmentName for fragment subtypes for fragment masking

## 2.7.4

### Patch Changes

- 337fd4f77: WP: [typescript-resolvers] Add directiveContextTypes option

## 2.7.3

### Patch Changes

- 54718c039: Improve @Deprecated Enum Type developer experience

## 2.7.2

### Patch Changes

- 11d05e361: fix(resolvers): fix conflict between `typesPrefix: true` and `enumPrefix: false`

## 2.7.1

### Patch Changes

- fd55e2039: fix incorrect type generation when using the inlineFragmentTypes 'combine' option that resulted in generating masked fragment output.

## 2.7.0

### Minor Changes

- 1479233df: Add new `inlineFragmentTypes` mode `'mask'`, which allows generating masked fragment types.

## 2.6.0

### Minor Changes

- bef4376d5: fix: RequireFields generic making all other fields optional

### Patch Changes

- c8ef37ae0: fix(typescript-resolvers): Fix optional field types
- be7cb3a82: Performance work: resolvers plugins, documents loading
- Updated dependencies [754a33715]
  - @graphql-codegen/plugin-helpers@2.4.0

## 2.5.2

### Patch Changes

- 6002feb3d: Fix exports in package.json files for react-native projects
- Updated dependencies [6002feb3d]
  - @graphql-codegen/plugin-helpers@2.3.2

## 2.5.1

### Patch Changes

- a9f1f1594: Use maybeValue as default output for optionals on preResolveTypes: true
- 9ea6621ec: add missing ListType method parameters

## 2.5.0

### Minor Changes

- 97ddb487a: feat: GraphQL v16 compatibility

### Patch Changes

- Updated dependencies [97ddb487a]
  - @graphql-codegen/plugin-helpers@2.3.0

## 2.4.0

### Minor Changes

- ad02cb9b8: Fixed an issue where ResolversParentTypes referenced non-existing fields of ResolversParentTypes when the corresponding type was a mapped enum.

## 2.3.0

### Minor Changes

- b9e85adae: feat(visitor-plugin-common): support custom scalar type from extensions

### Patch Changes

- 3c2c847be: Fix dedupleFragments option for typescript-react-query (and possibly others)
- Updated dependencies [7c60e5acc]
  - @graphql-codegen/plugin-helpers@2.2.0

## 2.2.1

### Patch Changes

- 0b090e31a: Apply proper indentation to DirectiveArgs types

## 2.2.0

### Minor Changes

- d6c2d4c09: Allow declaring Argument and InputType field mappings based on directive annotations.

  **WARNING:** Using this option does only change the type definitions.

  For actually ensuring that a type is correct at runtime you will have to use schema transforms (e.g. with [@graphql-tools/utils mapSchema](https://www.graphql-tools.com/docs/schema-directives)) that apply those rules! Otherwise, you might end up with a runtime type mismatch which could cause unnoticed bugs or runtime errors.

  Please use this configuration option with care!

  ```yaml
  plugins:
    config:
      directiveArgumentAndInputFieldMappings:
        asNumber: number
  ```

  ```graphql
  directive @asNumber on ARGUMENT_DEFINITION | INPUT_FIELD_DEFINITION

  input MyInput {
    id: ID! @asNumber
  }

  type User {
    id: ID!
  }

  type Query {
    user(id: ID! @asNumber): User
  }
  ```

  Usage e.g. with `typescript-resolvers`

  ```ts
  const Query: QueryResolvers = {
    user(_, args) {
      // args.id is of type 'number'
    },
  };
  ```

- 5086791ac: Allow overwriting the resolver type signature based on directive usages.

  **WARNING:** Using this option does only change the generated type definitions.

  For actually ensuring that a type is correct at runtime you will have to use schema transforms (e.g. with [@graphql-tools/utils mapSchema](https://www.graphql-tools.com/docs/schema-directives)) that apply those rules! Otherwise, you might end up with a runtime type mismatch which could cause unnoticed bugs or runtime errors.

  Example configuration:

  ```yaml
  config:
    # This was possible before
    customResolverFn: ../resolver-types.ts#UnauthenticatedResolver
    # This is new
    directiveResolverMappings:
      authenticated: ../resolvers-types.ts#AuthenticatedResolver
  ```

  Example mapping file (`resolver-types.ts`):

  ```ts
  export type UnauthenticatedContext = {
    user: null;
  };

  export type AuthenticatedContext = {
    user: { id: string };
  };

  export type UnauthenticatedResolver<TResult, TParent, _TContext, TArgs> = (
    parent: TParent,
    args: TArgs,
    context: UnauthenticatedContext,
    info: GraphQLResolveInfo
  ) => Promise<TResult> | TResult;

  export type AuthenticatedResolver<TResult, TParent, _TContext, TArgs> = (
    parent: TParent,
    args: TArgs,
    context: AuthenticatedContext,
    info: GraphQLResolveInfo
  ) => Promise<TResult> | TResult;
  ```

  Example Schema:

  ```graphql
  directive @authenticated on FIELD_DEFINITION

  type Query {
    yee: String
    foo: String @authenticated
  }
  ```

### Patch Changes

- feeae1c66: Do not throw an error when trying to merge inline fragment usages.

## 2.1.2

### Patch Changes

- 6470e6cc9: fix(plugin-helpers): remove unnecessary import
- 263570e50: Don't generate duplicate imports for the same identifier
- Updated dependencies [6470e6cc9]
- Updated dependencies [35199dedf]
  - @graphql-codegen/plugin-helpers@2.1.1

## 2.1.1

### Patch Changes

- aabeff181: Don't generate import statements for fragments declared in the file we're outputting to

## 2.1.0

### Minor Changes

- 290170262: add getOperationVariableName function to ClientSideBasePluginConfig class
- 440172cfe: support ESM

### Patch Changes

- 24185985a: bump graphql-tools package versions
- Updated dependencies [24185985a]
- Updated dependencies [39773f59b]
- Updated dependencies [440172cfe]
  - @graphql-codegen/plugin-helpers@2.1.0

## 2.0.0

### Major Changes

- d80efdec4: Change `preResolveTypes` default to be `true` for more readable types
- b0cb13df4: Update to latest `graphql-tools` and `graphql-config` version.

  ‼️ ‼️ ‼️ Please note ‼️ ‼️ ‼️:

  This is a breaking change since Node 10 is no longer supported in `graphql-tools`, and also no longer supported for Codegen packages.

### Patch Changes

- d80efdec4: Add option `inlineFragmentTypes` for deep inlining fragment types within operation types. This `inlineFragmentTypes` is set to `inline` by default (Previous behaviour is `combine`).

  This behavior is the better default for users that only use Fragments for building operations and then want to have access to all the data via the operation type (instead of accessing slices of the data via fragments).

- Updated dependencies [b0cb13df4]
  - @graphql-codegen/plugin-helpers@2.0.0

## 1.22.0

### Minor Changes

- 9005cc17: add `allowEnumStringTypes` option for allowing string literals as valid return types from resolvers in addition to enum values.\_

### Patch Changes

- df19a4ed: Allow multiple `{T}` instances in defaultMapper
- Updated dependencies [470336a1]
  - @graphql-codegen/plugin-helpers@1.18.8

## 1.21.3

### Patch Changes

- 6762aff5: Fix for array types with @skip @include directives

## 1.21.2

### Patch Changes

- 6aaecf1c: Fix issues with missing sub-fragments when skipTypename: true

## 1.21.1

### Patch Changes

- cf1e5abc: Introduce new feature for removing duplicated fragments

## 1.21.0

### Minor Changes

- 8da7dff6: Skip typechecking on generated values by casting to unknown

### Patch Changes

- dfd25caf: chore(deps): bump graphql-tools versions
- Updated dependencies [dfd25caf]
  - @graphql-codegen/plugin-helpers@1.18.7

## 1.20.0

### Minor Changes

- f0b5ea53: Add entireFieldWrapperValue configuration option, to wrap arrays
- 097bea2f: Added new configuration settings for scalars: `strictScalars` and `defaultScalarType`

### Patch Changes

- d9212aa0: fix(visitor-plugin-common): guard for a runtime type error
- Updated dependencies [d9212aa0]
  - @graphql-codegen/plugin-helpers@1.18.5

## 1.19.1

### Patch Changes

- 23862e7e: fix(naming-convention): revert and pin change-case-all dependency for workaround #3256
- Updated dependencies [23862e7e]
  - @graphql-codegen/plugin-helpers@1.18.4

## 1.19.0

### Minor Changes

- d4942d04: NEW CONFIG (`onlyResolveTypeForInterfaces`): Allow to generate only \_\_resolveType for interfaces

### Patch Changes

- e947f8e3: Allow to have declarationKind of type: class, interface: interface
- 29b75b1e: enhance(docs): improve docs for naming convention
- 1f6f3db6: Fix for @skip @include directives upon arrays
- 29b75b1e: enhance(namingConvention): use change-case-all instead of individual packages for naming convention
- Updated dependencies [29b75b1e]
  - @graphql-codegen/plugin-helpers@1.18.3

## 1.18.3

### Patch Changes

- 5749cb8a: chore: fix type-level incompatibilities of the `avoidOptionals`
- 5a12fe58: fix type error on parsing enums

## 1.18.2

### Patch Changes

- ca66569f: Fix issues with undefined calls for str.replace

## 1.18.1

### Patch Changes

- 63be0f40: Fix issues with empty interfaces causing syntax issues
- 190482a1: add support for fragment variables
- 4444348d: Correctly escape enum values defined in the GraphQLSchema object
- 142b32b3: Better support for @skip/@include directives with complex selection sets
- 42213fa0: Strip trailing whitespace from some output

## 1.18.0

### Minor Changes

- bd4bf7cf: feat(visitor-plugin-common): add ignoreEnumValuesFromSchema to ignore enum values from GraphQLSchema

## 1.17.22

### Patch Changes

- 64293437: Support for input lists coercion
- fd5843a7: Fixed a bug where some import namespacing is missed when generating resolver types.
- d75051f5: generate correct types for fragments with an interface type condition that are spread on an interface field.

## 1.17.21

### Patch Changes

- 8356f8a2: Extended behaviour to allow support in `internalResolversPrefix` flag for resolvers plugin

## 1.17.20

### Patch Changes

- 1183d173: Bump all packages to resolve issues with shared dependencies
- Updated dependencies [1183d173]
  - @graphql-codegen/plugin-helpers@1.18.2

## 1.17.19

### Patch Changes

- 99819bf1: Improve DocumentNode optimization for plugins that generate it
- c3b59e81: Extract buildMapperImport to external function

## 1.17.18

### Patch Changes

- faa13973: Fixed a bug in `parseMapper` that were preventing to use mappers with complex type usages

## 1.17.17

### Patch Changes

- 612e5e52: remove broken isTypeOf call for expanding fragments with flattenGeneratedTypes = true
- 9f2a4e2f: Expose `_hasRequiredVariables` to `buildOperation` in order to allow better type-safety for plugins that deals with `variables`
- 0f35e775: Fix issues with incorrect naming of operation and variables when used with typesSuffix
- Updated dependencies [eaf45d1f]
  - @graphql-codegen/plugin-helpers@1.18.1

## 1.17.16

### Patch Changes

- 92d8f876: Fixed unquoted numeric enum identifiers

## 1.17.15

### Patch Changes

- d2cde3d5: fixed isTypeOf resolvers signature
- 89a6aa80: Fixes issues with typesSuffix and arguments type name
- f603b8f8: Support unnamed queries in operation visitors
- Updated dependencies [da8bdd17]
  - @graphql-codegen/plugin-helpers@1.17.9

## 1.17.14

### Patch Changes

- 07f9b1b2: Fix a bug caused numeric enum values defined in the GraphQLSchema to be printed incorrectly
- 35f67120: bugfix: allow to specify mappers for GraphQL `interface` and override the default behaviour.

## 1.17.13

### Patch Changes

- 1d7c6432: Bump all packages to allow "^" in deps and fix compatibility issues
- 1d7c6432: Bump versions of @graphql-tools/ packages to fix issues with loading schemas and SDL comments
- Updated dependencies [1d7c6432]
- Updated dependencies [1d7c6432]
  - @graphql-codegen/plugin-helpers@1.17.8

## 1.17.12

### Patch Changes

- 4266a15f: Allow getDocumentNodeSignature to control the entire generation flow of the typed documents

## 1.17.11

### Patch Changes

- ee2b01a3: Fixes for issues with publish command

## 1.17.10

### Patch Changes

- 6cb9c96d: Fixes issues with previous release

## 1.17.9

### Patch Changes

- bccfd28c: Allow to set `gqlImport` to a clean `gql` string and skip import generating

## 1.17.8

### Patch Changes

- ce3a5798: Publish minor version to include fixes for client-side-base-visitor, required to v2 of ts-react-apollo plugin (for unified apollo import)
