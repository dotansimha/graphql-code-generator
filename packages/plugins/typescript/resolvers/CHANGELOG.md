# @graphql-codegen/typescript-resolvers

## 1.19.3

### Patch Changes

- Updated dependencies [cf1e5abc]
  - @graphql-codegen/visitor-plugin-common@1.21.1
  - @graphql-codegen/typescript@1.22.2

## 1.19.2

### Patch Changes

- dfd25caf: chore(deps): bump graphql-tools versions
- Updated dependencies [dfd25caf]
- Updated dependencies [8da7dff6]
  - @graphql-codegen/visitor-plugin-common@1.21.0
  - @graphql-codegen/plugin-helpers@1.18.7
  - @graphql-codegen/typescript@1.22.1

## 1.19.1

### Patch Changes

- d9212aa0: fix(visitor-plugin-common): guard for a runtime type error
- Updated dependencies [d9212aa0]
- Updated dependencies [f0b5ea53]
- Updated dependencies [097bea2f]
  - @graphql-codegen/visitor-plugin-common@1.20.0
  - @graphql-codegen/typescript@1.22.0
  - @graphql-codegen/plugin-helpers@1.18.5

## 1.19.0

### Minor Changes

- d4942d04: NEW CONFIG (`onlyResolveTypeForInterfaces`): Allow to generate only \_\_resolveType for interfaces

### Patch Changes

- 29b75b1e: enhance(namingConvention): use change-case-all instead of individual packages for naming convention
- Updated dependencies [e947f8e3]
- Updated dependencies [29b75b1e]
- Updated dependencies [d4942d04]
- Updated dependencies [1f6f3db6]
- Updated dependencies [29b75b1e]
  - @graphql-codegen/visitor-plugin-common@1.19.0
  - @graphql-codegen/typescript@1.21.1
  - @graphql-codegen/plugin-helpers@1.18.3

## 1.18.2

### Patch Changes

- 5749cb8a: chore: fix type-level incompatibilities of the `avoidOptionals`
- Updated dependencies [34b8087e]
- Updated dependencies [5749cb8a]
- Updated dependencies [5a12fe58]
  - @graphql-codegen/typescript@1.21.0
  - @graphql-codegen/visitor-plugin-common@1.18.3

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
