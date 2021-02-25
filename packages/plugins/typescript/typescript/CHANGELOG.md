# @graphql-codegen/typescript

## 1.21.0

### Minor Changes

- 34b8087e: Adds futureProofUnion option to account for a possible unknown new type added to union types

### Patch Changes

- Updated dependencies [5749cb8a]
- Updated dependencies [5a12fe58]
  - @graphql-codegen/visitor-plugin-common@1.18.3

## 1.20.2

### Patch Changes

- ca66569f: Fix issues with undefined calls for str.replace
- Updated dependencies [ca66569f]
  - @graphql-codegen/visitor-plugin-common@1.18.2

## 1.20.1

### Patch Changes

- 4444348d: Correctly escape enum values defined in the GraphQLSchema object
- Updated dependencies [63be0f40]
- Updated dependencies [190482a1]
- Updated dependencies [4444348d]
- Updated dependencies [142b32b3]
- Updated dependencies [42213fa0]
  - @graphql-codegen/visitor-plugin-common@1.18.1

## 1.20.0

### Minor Changes

- d95db95b: feat(typescript): bump visitor-plugin-common

## 1.19.0

### Minor Changes

- 1d6a593f: Added `useImplementingTypes` flag for generating code that uses implementing types instead of interfaces

### Patch Changes

- Updated dependencies [8356f8a2]
  - @graphql-codegen/visitor-plugin-common@1.17.21

## 1.18.1

### Patch Changes

- 1183d173: Bump all packages to resolve issues with shared dependencies
- Updated dependencies [1183d173]
  - @graphql-codegen/visitor-plugin-common@1.17.20
  - @graphql-codegen/plugin-helpers@1.18.2

## 1.18.0

### Minor Changes

- 49242c20: Added a "defaultValue" option in the "avoidOptionals" config
  See https://github.com/dotansimha/graphql-code-generator/issues/5112

### Patch Changes

- Updated dependencies [99819bf1]
- Updated dependencies [c3b59e81]
  - @graphql-codegen/visitor-plugin-common@1.17.19

## 1.17.11

### Patch Changes

- 077cf064: Fixed reading of enumValues config values
- 92d8f876: Fixed unquoted numeric enum identifiers
- Updated dependencies [92d8f876]
  - @graphql-codegen/visitor-plugin-common@1.17.16

## 1.17.10

### Patch Changes

- 7ad7a1ae: Make non nullable input field with default value optional
- Updated dependencies [d2cde3d5]
- Updated dependencies [89a6aa80]
- Updated dependencies [f603b8f8]
- Updated dependencies [da8bdd17]
  - @graphql-codegen/visitor-plugin-common@1.17.15
  - @graphql-codegen/plugin-helpers@1.17.9

## 1.17.9

### Patch Changes

- 07f9b1b2: Fix a bug caused numeric enum values defined in the GraphQLSchema to be printed incorrectly
- Updated dependencies [07f9b1b2]
- Updated dependencies [35f67120]
  - @graphql-codegen/visitor-plugin-common@1.17.14

## 1.17.8

### Patch Changes

- 1d7c6432: Bump all packages to allow "^" in deps and fix compatibility issues
- 1d7c6432: Bump versions of @graphql-tools/ packages to fix issues with loading schemas and SDL comments
- Updated dependencies [1d7c6432]
- Updated dependencies [1d7c6432]
  - @graphql-codegen/visitor-plugin-common@1.17.13
  - @graphql-codegen/plugin-helpers@1.17.8
