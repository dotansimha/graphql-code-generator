# @graphql-codegen/visitor-plugin-common

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
