# @graphql-codegen/java

## 3.1.6

### Patch Changes

- Updated dependencies [ad02cb9b8]
  - @graphql-codegen/visitor-plugin-common@2.4.0
  - @graphql-codegen/java-common@2.1.6

## 3.1.5

### Patch Changes

- Updated dependencies [b9e85adae]
- Updated dependencies [7c60e5acc]
- Updated dependencies [3c2c847be]
  - @graphql-codegen/visitor-plugin-common@2.3.0
  - @graphql-codegen/plugin-helpers@2.2.0
  - @graphql-codegen/java-common@2.1.5

## 3.1.4

### Patch Changes

- Updated dependencies [0b090e31a]
  - @graphql-codegen/visitor-plugin-common@2.2.1
  - @graphql-codegen/java-common@2.1.4

## 3.1.3

### Patch Changes

- Updated dependencies [d6c2d4c09]
- Updated dependencies [feeae1c66]
- Updated dependencies [5086791ac]
  - @graphql-codegen/visitor-plugin-common@2.2.0
  - @graphql-codegen/java-common@2.1.3

## 3.1.2

### Patch Changes

- Updated dependencies [6470e6cc9]
- Updated dependencies [263570e50]
- Updated dependencies [35199dedf]
  - @graphql-codegen/visitor-plugin-common@2.1.2
  - @graphql-codegen/plugin-helpers@2.1.1
  - @graphql-codegen/java-common@2.1.2

## 3.1.1

### Patch Changes

- Updated dependencies [aabeff181]
  - @graphql-codegen/visitor-plugin-common@2.1.1
  - @graphql-codegen/java-common@2.1.1

## 3.1.0

### Minor Changes

- 39773f59b: enhance(plugins): use getDocumentNodeFromSchema and other utilities from @graphql-tools/utils
- 440172cfe: support ESM

### Patch Changes

- Updated dependencies [290170262]
- Updated dependencies [24185985a]
- Updated dependencies [39773f59b]
- Updated dependencies [440172cfe]
  - @graphql-codegen/visitor-plugin-common@2.1.0
  - @graphql-codegen/plugin-helpers@2.1.0
  - @graphql-codegen/java-common@2.1.0

## 3.0.0

### Major Changes

- b0cb13df4: Update to latest `graphql-tools` and `graphql-config` version.

  ‼️ ‼️ ‼️ Please note ‼️ ‼️ ‼️:

  This is a breaking change since Node 10 is no longer supported in `graphql-tools`, and also no longer supported for Codegen packages.

### Minor Changes

- 1da66a6cb: revert removal of `valueOfLabel` in Enum generation

### Patch Changes

- Updated dependencies [d80efdec4]
- Updated dependencies [d80efdec4]
- Updated dependencies [b0cb13df4]
  - @graphql-codegen/visitor-plugin-common@2.0.0
  - @graphql-codegen/java-common@2.0.0
  - @graphql-codegen/plugin-helpers@2.0.0

## 2.0.4

### Patch Changes

- Updated dependencies [df19a4ed]
- Updated dependencies [470336a1]
- Updated dependencies [9005cc17]
  - @graphql-codegen/visitor-plugin-common@1.22.0
  - @graphql-codegen/plugin-helpers@1.18.8
  - @graphql-codegen/java-common@1.17.13

## 2.0.3

### Patch Changes

- Updated dependencies [6762aff5]
  - @graphql-codegen/visitor-plugin-common@1.21.3
  - @graphql-codegen/java-common@1.17.12

## 2.0.2

### Patch Changes

- Updated dependencies [6aaecf1c]
  - @graphql-codegen/visitor-plugin-common@1.21.2
  - @graphql-codegen/java-common@1.17.11

## 2.0.1

### Patch Changes

- Updated dependencies [cf1e5abc]
- Updated dependencies [541e5497]
  - @graphql-codegen/visitor-plugin-common@1.21.1
  - @graphql-codegen/java-common@1.17.10

## 2.0.0

### Major Changes

- 7ae711cc: Replace java reserved keyword new with \_new

### Minor Changes

- 7ae711cc: Empty constructor changed to be a configuration option (default false) to fix breaking change

### Patch Changes

- Updated dependencies [dfd25caf]
- Updated dependencies [8da7dff6]
  - @graphql-codegen/visitor-plugin-common@1.21.0
  - @graphql-codegen/plugin-helpers@1.18.7

## 2.0.0

### Major Changes

- 9481e469: Replace java reserved keyword new with \_new

## 1.19.0

### Minor Changes

- 097bea2f: Added new configuration settings for scalars: `strictScalars` and `defaultScalarType`

### Patch Changes

- Updated dependencies [d9212aa0]
- Updated dependencies [f0b5ea53]
- Updated dependencies [097bea2f]
  - @graphql-codegen/visitor-plugin-common@1.20.0
  - @graphql-codegen/plugin-helpers@1.18.5

## 1.18.0

### Minor Changes

- cc3864b3: Added new configuration for `classMembersPrefix`

### Patch Changes

- cc3864b3: Fix issues with compilation errors
- cc3864b3: Fix issues with missing imports and incorrect naming.
- 6634ee10: Fixed error compiliation, changed to empty constructor and using setters
- Updated dependencies [8356f8a2]
  - @graphql-codegen/visitor-plugin-common@1.17.21

## 1.17.9

### Patch Changes

- 1183d173: Bump all packages to resolve issues with shared dependencies
- Updated dependencies [1183d173]
  - @graphql-codegen/visitor-plugin-common@1.17.20
  - @graphql-codegen/java-common@1.17.9
  - @graphql-codegen/plugin-helpers@1.18.2

## 1.17.8

### Patch Changes

- 1d7c6432: Bump all packages to allow "^" in deps and fix compatibility issues
- 1d7c6432: Bump versions of @graphql-tools/ packages to fix issues with loading schemas and SDL comments
- Updated dependencies [1d7c6432]
- Updated dependencies [1d7c6432]
  - @graphql-codegen/visitor-plugin-common@1.17.13
  - @graphql-codegen/plugin-helpers@1.17.8
  - @graphql-codegen/java-common@1.17.8
