# @graphql-codegen/graphql-modules-preset

## 1.2.5

### Patch Changes

- d9212aa0: fix(visitor-plugin-common): guard for a runtime type error
- Updated dependencies [d9212aa0]
- Updated dependencies [f0b5ea53]
- Updated dependencies [097bea2f]
  - @graphql-codegen/visitor-plugin-common@1.20.0
  - @graphql-codegen/plugin-helpers@1.18.5

## 1.2.4

### Patch Changes

- 23862e7e: fix(naming-convention): revert and pin change-case-all dependency for workaround #3256
- Updated dependencies [23862e7e]
  - @graphql-codegen/visitor-plugin-common@1.19.1
  - @graphql-codegen/plugin-helpers@1.18.4

## 1.2.3

### Patch Changes

- 7615c6cd: Revery enum-resolvers since it's causing issues

## 1.2.2

### Patch Changes

- f7a94f9d: Include enum resolvers
- 3cba8833: Fixed issue with preset breaking when pattern doesn't match
- 29b75b1e: enhance(namingConvention): use change-case-all instead of individual packages for naming convention
- Updated dependencies [e947f8e3]
- Updated dependencies [29b75b1e]
- Updated dependencies [d4942d04]
- Updated dependencies [1f6f3db6]
- Updated dependencies [29b75b1e]
  - @graphql-codegen/visitor-plugin-common@1.19.0
  - @graphql-codegen/plugin-helpers@1.18.3

## 1.2.1

### Patch Changes

- c7cb4195: fix(graphql-modules-preset): apply naming convention to scalar config references in module typings
- Updated dependencies [63be0f40]
- Updated dependencies [190482a1]
- Updated dependencies [4444348d]
- Updated dependencies [142b32b3]
- Updated dependencies [42213fa0]
  - @graphql-codegen/visitor-plugin-common@1.18.1

## 1.2.0

### Minor Changes

- f1b99b90: Added support for generating module types as `d.ts`

### Patch Changes

- Updated dependencies [64293437]
- Updated dependencies [fd5843a7]
- Updated dependencies [d75051f5]
  - @graphql-codegen/visitor-plugin-common@1.17.22

## 1.1.0

### Minor Changes

- 6b708b69: Added `importBaseTypesFrom` flag to allow customizations of the import for the base types

### Patch Changes

- 1183d173: Bump all packages to resolve issues with shared dependencies
- Updated dependencies [1183d173]
  - @graphql-codegen/visitor-plugin-common@1.17.20
  - @graphql-codegen/plugin-helpers@1.18.2

## 1.0.0

### Major Changes

- faa13973: New Plugin!

### Patch Changes

- Updated dependencies [faa13973]
  - @graphql-codegen/visitor-plugin-common@1.17.18
