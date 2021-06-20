# @graphql-codegen/flow-operations

## 1.18.10

### Patch Changes

- Updated dependencies [cf1e5abc]
  - @graphql-codegen/visitor-plugin-common@1.21.1
  - @graphql-codegen/flow@1.19.2

## 1.18.9

### Patch Changes

- Updated dependencies [dfd25caf]
- Updated dependencies [8da7dff6]
  - @graphql-codegen/visitor-plugin-common@1.21.0
  - @graphql-codegen/plugin-helpers@1.18.7
  - @graphql-codegen/flow@1.19.1

## 1.18.8

### Patch Changes

- d9212aa0: fix(visitor-plugin-common): guard for a runtime type error
- Updated dependencies [d9212aa0]
- Updated dependencies [f0b5ea53]
- Updated dependencies [097bea2f]
  - @graphql-codegen/flow@1.19.0
  - @graphql-codegen/visitor-plugin-common@1.20.0
  - @graphql-codegen/plugin-helpers@1.18.5

## 1.18.7

### Patch Changes

- 1f6f3db6: Fix for @skip @include directives upon arrays
- 29b75b1e: enhance(namingConvention): use change-case-all instead of individual packages for naming convention
- Updated dependencies [e947f8e3]
- Updated dependencies [29b75b1e]
- Updated dependencies [d4942d04]
- Updated dependencies [1f6f3db6]
- Updated dependencies [29b75b1e]
  - @graphql-codegen/visitor-plugin-common@1.19.0
  - @graphql-codegen/flow@1.18.5
  - @graphql-codegen/plugin-helpers@1.18.3

## 1.18.6

### Patch Changes

- 63be0f40: Fix issues with empty interfaces causing syntax issues
- 142b32b3: @skip, @include directives resolve to optional fields
- 142b32b3: Better support for @skip/@include directives with complex selection sets
- 71944a66: fix for irrelevane 'Maybe' type
- Updated dependencies [63be0f40]
- Updated dependencies [190482a1]
- Updated dependencies [4444348d]
- Updated dependencies [142b32b3]
- Updated dependencies [42213fa0]
  - @graphql-codegen/visitor-plugin-common@1.18.1
  - @graphql-codegen/flow@1.18.3

## 1.18.5

### Patch Changes

- 64293437: Support for input lists coercion
- Updated dependencies [64293437]
- Updated dependencies [fd5843a7]
- Updated dependencies [d75051f5]
  - @graphql-codegen/visitor-plugin-common@1.17.22

## 1.18.4

### Patch Changes

- 1183d173: Bump all packages to resolve issues with shared dependencies
- Updated dependencies [1183d173]
  - @graphql-codegen/visitor-plugin-common@1.17.20
  - @graphql-codegen/flow@1.18.2
  - @graphql-codegen/plugin-helpers@1.18.2

## 1.18.3

### Patch Changes

- 475aa9b8: @skip, @include directives resolve to optional fields
- Updated dependencies [faa13973]
  - @graphql-codegen/visitor-plugin-common@1.17.18

## 1.18.2

### Patch Changes

- 0a519e29: Fixes generation of type imports for fragments
- 612e5e52: Remove broken isTypeOf call (always undefined in graphql-tools v6)
- Updated dependencies [612e5e52]
- Updated dependencies [9f2a4e2f]
- Updated dependencies [0f35e775]
- Updated dependencies [eaf45d1f]
  - @graphql-codegen/visitor-plugin-common@1.17.17
  - @graphql-codegen/plugin-helpers@1.18.1

## 1.18.1

### Patch Changes

- bc5e4c83: Consolidate `// @flow` declarations to avoid duplicates
- Updated dependencies [bc5e4c83]
  - @graphql-codegen/flow@1.18.1

## 1.18.0

### Minor Changes

- 4e3df8f2: Fix bug with read-only type generation when using preResolveTypes flag

## 1.17.8

### Patch Changes

- 1d7c6432: Bump all packages to allow "^" in deps and fix compatibility issues
- 1d7c6432: Bump versions of @graphql-tools/ packages to fix issues with loading schemas and SDL comments
- Updated dependencies [e0d04cb6]
- Updated dependencies [1d7c6432]
- Updated dependencies [1d7c6432]
  - @graphql-codegen/flow@1.18.0
  - @graphql-codegen/visitor-plugin-common@1.17.13
  - @graphql-codegen/plugin-helpers@1.17.8
