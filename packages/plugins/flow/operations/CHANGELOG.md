# @graphql-codegen/flow-operations

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
