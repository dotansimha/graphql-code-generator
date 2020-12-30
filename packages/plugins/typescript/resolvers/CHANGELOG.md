# @graphql-codegen/typescript-resolvers

## 1.19.0

### Minor Changes

- b6746105: feat(visitor-plugin-common): add ignoreEnumValuesFromSchema to ignore enum values from GraphQLSchema

### Patch Changes

- Updated dependencies [b6746105]
  - @graphql-codegen/visitor-plugin-common@1.19.0

## 1.18.1

### Patch Changes

- fd5843a7: Fixed a bug where some import namespacing is missed when generating resolver types.
- Updated dependencies [64293437]
- Updated dependencies [fd5843a7]
- Updated dependencies [d75051f5]
  - @graphql-codegen/visitor-plugin-common@1.17.22

## 1.18.0

### Minor Changes

- 8356f8a2: Added a new config flag for customizing `isTypeOf` and `resolveType` prefix (`internalResolversPrefix`)

### Patch Changes

- Updated dependencies [8356f8a2]
- Updated dependencies [1d6a593f]
  - @graphql-codegen/visitor-plugin-common@1.17.21
  - @graphql-codegen/typescript@1.19.0

## 1.17.12

### Patch Changes

- 1183d173: Bump all packages to resolve issues with shared dependencies
- Updated dependencies [1183d173]
  - @graphql-codegen/visitor-plugin-common@1.17.20
  - @graphql-codegen/typescript@1.18.1
  - @graphql-codegen/plugin-helpers@1.18.2

## 1.17.11

### Patch Changes

- faa13973: Fixed issues with mappers setup
- Updated dependencies [faa13973]
  - @graphql-codegen/visitor-plugin-common@1.17.18

## 1.17.10

### Patch Changes

- d2cde3d5: fixed isTypeOf resolvers signature
- 89a6aa80: Fixes issues with typesSuffix and arguments type name
- Updated dependencies [d2cde3d5]
- Updated dependencies [89a6aa80]
- Updated dependencies [f603b8f8]
- Updated dependencies [7ad7a1ae]
- Updated dependencies [da8bdd17]
  - @graphql-codegen/visitor-plugin-common@1.17.15
  - @graphql-codegen/typescript@1.17.10
  - @graphql-codegen/plugin-helpers@1.17.9

## 1.17.9

### Patch Changes

- ed7f6b97: Fix issues with mappers not being applied for interfaces or unions

## 1.17.8

### Patch Changes

- 1d7c6432: Bump all packages to allow "^" in deps and fix compatibility issues
- 1d7c6432: Bump versions of @graphql-tools/ packages to fix issues with loading schemas and SDL comments
- af3803b8: only transform federated parent types when they contain @external directive
- Updated dependencies [1d7c6432]
- Updated dependencies [1d7c6432]
  - @graphql-codegen/visitor-plugin-common@1.17.13
  - @graphql-codegen/plugin-helpers@1.17.8
  - @graphql-codegen/typescript@1.17.8
