# @graphql-codegen/flow-resolvers

## 2.2.0

### Minor Changes

- 97ddb487a: feat: GraphQL v16 compatibility

### Patch Changes

- Updated dependencies [97ddb487a]
  - @graphql-codegen/flow@2.2.0
  - @graphql-codegen/visitor-plugin-common@2.5.0
  - @graphql-codegen/plugin-helpers@2.3.0

## 2.1.6

### Patch Changes

- Updated dependencies [ad02cb9b8]
  - @graphql-codegen/visitor-plugin-common@2.4.0
  - @graphql-codegen/flow@2.1.6

## 2.1.5

### Patch Changes

- Updated dependencies [b9e85adae]
- Updated dependencies [7c60e5acc]
- Updated dependencies [3c2c847be]
  - @graphql-codegen/visitor-plugin-common@2.3.0
  - @graphql-codegen/plugin-helpers@2.2.0
  - @graphql-codegen/flow@2.1.5

## 2.1.4

### Patch Changes

- Updated dependencies [0b090e31a]
  - @graphql-codegen/visitor-plugin-common@2.2.1
  - @graphql-codegen/flow@2.1.4

## 2.1.3

### Patch Changes

- Updated dependencies [d6c2d4c09]
- Updated dependencies [feeae1c66]
- Updated dependencies [5086791ac]
  - @graphql-codegen/visitor-plugin-common@2.2.0
  - @graphql-codegen/flow@2.1.3

## 2.1.2

### Patch Changes

- Updated dependencies [6470e6cc9]
- Updated dependencies [263570e50]
- Updated dependencies [35199dedf]
  - @graphql-codegen/visitor-plugin-common@2.1.2
  - @graphql-codegen/plugin-helpers@2.1.1
  - @graphql-codegen/flow@2.1.2

## 2.1.1

### Patch Changes

- Updated dependencies [aabeff181]
  - @graphql-codegen/visitor-plugin-common@2.1.1
  - @graphql-codegen/flow@2.1.1

## 2.1.0

### Minor Changes

- 39773f59b: enhance(plugins): use getDocumentNodeFromSchema and other utilities from @graphql-tools/utils
- 440172cfe: support ESM

### Patch Changes

- 24185985a: bump graphql-tools package versions
- Updated dependencies [290170262]
- Updated dependencies [24185985a]
- Updated dependencies [39773f59b]
- Updated dependencies [440172cfe]
  - @graphql-codegen/visitor-plugin-common@2.1.0
  - @graphql-codegen/plugin-helpers@2.1.0
  - @graphql-codegen/flow@2.1.0

## 2.0.0

### Major Changes

- b0cb13df4: Update to latest `graphql-tools` and `graphql-config` version.

  ‼️ ‼️ ‼️ Please note ‼️ ‼️ ‼️:

  This is a breaking change since Node 10 is no longer supported in `graphql-tools`, and also no longer supported for Codegen packages.

### Patch Changes

- Updated dependencies [d80efdec4]
- Updated dependencies [d80efdec4]
- Updated dependencies [b0cb13df4]
  - @graphql-codegen/visitor-plugin-common@2.0.0
  - @graphql-codegen/flow@2.0.0
  - @graphql-codegen/plugin-helpers@2.0.0

## 1.17.18

### Patch Changes

- df19a4ed: Allow multiple `{T}` instances in defaultMapper
- Updated dependencies [df19a4ed]
- Updated dependencies [470336a1]
- Updated dependencies [9005cc17]
  - @graphql-codegen/visitor-plugin-common@1.22.0
  - @graphql-codegen/plugin-helpers@1.18.8
  - @graphql-codegen/flow@1.19.5

## 1.17.17

### Patch Changes

- Updated dependencies [6762aff5]
  - @graphql-codegen/visitor-plugin-common@1.21.3
  - @graphql-codegen/flow@1.19.4

## 1.17.16

### Patch Changes

- Updated dependencies [6aaecf1c]
  - @graphql-codegen/visitor-plugin-common@1.21.2
  - @graphql-codegen/flow@1.19.3

## 1.17.15

### Patch Changes

- 541e5497: Fixes for deps
- Updated dependencies [cf1e5abc]
  - @graphql-codegen/visitor-plugin-common@1.21.1
  - @graphql-codegen/flow@1.19.2

## 1.17.14

### Patch Changes

- dfd25caf: chore(deps): bump graphql-tools versions
- Updated dependencies [dfd25caf]
- Updated dependencies [8da7dff6]
  - @graphql-codegen/visitor-plugin-common@1.21.0
  - @graphql-codegen/plugin-helpers@1.18.7
  - @graphql-codegen/flow@1.19.1

## 1.17.13

### Patch Changes

- fd5843a7: Fixed a bug where some import namespacing is missed when generating resolver types.
- Updated dependencies [64293437]
- Updated dependencies [fd5843a7]
- Updated dependencies [d75051f5]
  - @graphql-codegen/visitor-plugin-common@1.17.22

## 1.17.12

### Patch Changes

- 1183d173: Bump all packages to resolve issues with shared dependencies
- Updated dependencies [1183d173]
  - @graphql-codegen/visitor-plugin-common@1.17.20
  - @graphql-codegen/flow@1.18.2
  - @graphql-codegen/plugin-helpers@1.18.2

## 1.17.11

### Patch Changes

- faa13973: Fixed issues with mappers setup
- Updated dependencies [faa13973]
  - @graphql-codegen/visitor-plugin-common@1.17.18

## 1.17.10

### Patch Changes

- d2cde3d5: fixed isTypeOf resolvers signature
- Updated dependencies [d2cde3d5]
- Updated dependencies [89a6aa80]
- Updated dependencies [f603b8f8]
- Updated dependencies [da8bdd17]
  - @graphql-codegen/visitor-plugin-common@1.17.15
  - @graphql-codegen/plugin-helpers@1.17.9

## 1.17.9

### Patch Changes

- ed7f6b97: Fix issues with mappers not being applied for interfaces or unions

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
