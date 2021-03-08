# @graphql-codegen/typescript-vue-apollo

## 2.3.2

### Patch Changes

- 29b75b1e: enhance(namingConvention): use change-case-all instead of individual packages for naming convention
- Updated dependencies [e947f8e3]
- Updated dependencies [29b75b1e]
- Updated dependencies [d4942d04]
- Updated dependencies [1f6f3db6]
- Updated dependencies [29b75b1e]
  - @graphql-codegen/visitor-plugin-common@1.19.0
  - @graphql-codegen/plugin-helpers@1.18.3

## 2.3.1

### Patch Changes

- 1183d173: Bump all packages to resolve issues with shared dependencies
- Updated dependencies [1183d173]
  - @graphql-codegen/visitor-plugin-common@1.17.20
  - @graphql-codegen/plugin-helpers@1.18.2

## 2.3.0

### Minor Changes

- bd3bd296: Improve DocumentNode optimizations, to reduce bundle size when consumed as pre-compiled

### Patch Changes

- Updated dependencies [99819bf1]
- Updated dependencies [c3b59e81]
  - @graphql-codegen/visitor-plugin-common@1.17.19

## 2.2.1

### Patch Changes

- 4e0619e6: Use empty object as default value to variables parameter instead of question mark when variables of query is all optional.
- Updated dependencies [faa13973]
  - @graphql-codegen/visitor-plugin-common@1.17.18

## 2.2.0

### Minor Changes

- 36294d92: \* Support the `useTypeImports` options
  - Fix typing errors for operations without variables
  - Improve jsdoc

### Patch Changes

- b83668d2: Fix regression so omitOperationSuffix is respected again
- Updated dependencies [612e5e52]
- Updated dependencies [9f2a4e2f]
- Updated dependencies [0f35e775]
- Updated dependencies [eaf45d1f]
  - @graphql-codegen/visitor-plugin-common@1.17.17
  - @graphql-codegen/plugin-helpers@1.18.1

## 2.1.1

### Patch Changes

- dc3a510b: Allow the vue-apollo plugin to write code to .tsx files
- Updated dependencies [92d8f876]
  - @graphql-codegen/visitor-plugin-common@1.17.16

## 2.1.0

### Minor Changes

- a20d2f57: make composition api import configurable

### Patch Changes

- Updated dependencies [d2cde3d5]
- Updated dependencies [89a6aa80]
- Updated dependencies [f603b8f8]
- Updated dependencies [da8bdd17]
  - @graphql-codegen/visitor-plugin-common@1.17.15
  - @graphql-codegen/plugin-helpers@1.17.9

## 2.0.0

### Major Changes

- 868249a6: Address composition api changes

## 1.17.9

### Patch Changes

- d8f63b0d: Fix useMutation options. (#4540)
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
