# @graphql-codegen/typescript-operations

## 2.1.0

### Minor Changes

- 440172cfe: support ESM

### Patch Changes

- Updated dependencies [290170262]
- Updated dependencies [24185985a]
- Updated dependencies [39773f59b]
- Updated dependencies [440172cfe]
  - @graphql-codegen/visitor-plugin-common@2.1.0
  - @graphql-codegen/plugin-helpers@2.1.0
  - @graphql-codegen/typescript@2.1.0

## 2.0.1

### Patch Changes

- e8c8e9c06: Set `preResolveTypes: true` by default (should be there since v2)

## 2.0.0

### Major Changes

- d80efdec4: Change `preResolveTypes` default to be `true` for more readable types
- b0cb13df4: Update to latest `graphql-tools` and `graphql-config` version.

  ‼️ ‼️ ‼️ Please note ‼️ ‼️ ‼️:

  This is a breaking change since Node 10 is no longer supported in `graphql-tools`, and also no longer supported for Codegen packages.

### Patch Changes

- d80efdec4: Add option `inlineFragmentTypes` for deep inlining fragment types within operation types. This `inlineFragmentTypes` is set to `inline` by default (Previous behaviour is `combine`).

  This behavior is the better default for users that only use Fragments for building operations and then want to have access to all the data via the operation type (instead of accessing slices of the data via fragments).

- Updated dependencies [d80efdec4]
- Updated dependencies [d80efdec4]
- Updated dependencies [b0cb13df4]
  - @graphql-codegen/visitor-plugin-common@2.0.0
  - @graphql-codegen/typescript@2.0.0
  - @graphql-codegen/plugin-helpers@2.0.0

## 1.18.4

### Patch Changes

- Updated dependencies [df19a4ed]
- Updated dependencies [470336a1]
- Updated dependencies [9005cc17]
  - @graphql-codegen/visitor-plugin-common@1.22.0
  - @graphql-codegen/plugin-helpers@1.18.8
  - @graphql-codegen/typescript@1.23.0

## 1.18.3

### Patch Changes

- 6762aff5: Fix for array types with @skip @include directives
- Updated dependencies [6762aff5]
  - @graphql-codegen/visitor-plugin-common@1.21.3
  - @graphql-codegen/typescript@1.22.4

## 1.18.2

### Patch Changes

- 6aaecf1c: Fix issues with missing sub-fragments when skipTypename: true
- Updated dependencies [6aaecf1c]
  - @graphql-codegen/visitor-plugin-common@1.21.2
  - @graphql-codegen/typescript@1.22.3

## 1.18.1

### Patch Changes

- Updated dependencies [cf1e5abc]
  - @graphql-codegen/visitor-plugin-common@1.21.1
  - @graphql-codegen/typescript@1.22.2

## 1.18.0

### Minor Changes

- 0a909869: Add arrayInputCoercion option

### Patch Changes

- Updated dependencies [dfd25caf]
- Updated dependencies [8da7dff6]
  - @graphql-codegen/visitor-plugin-common@1.21.0
  - @graphql-codegen/plugin-helpers@1.18.7
  - @graphql-codegen/typescript@1.22.1

## 1.17.16

### Patch Changes

- d9212aa0: fix(visitor-plugin-common): guard for a runtime type error
- Updated dependencies [d9212aa0]
- Updated dependencies [f0b5ea53]
- Updated dependencies [097bea2f]
  - @graphql-codegen/visitor-plugin-common@1.20.0
  - @graphql-codegen/typescript@1.22.0
  - @graphql-codegen/plugin-helpers@1.18.5

## 1.17.15

### Patch Changes

- 1f6f3db6: Fix for @skip @include directives upon arrays
- 29b75b1e: enhance(namingConvention): use change-case-all instead of individual packages for naming convention
- Updated dependencies [e947f8e3]
- Updated dependencies [29b75b1e]
- Updated dependencies [d4942d04]
- Updated dependencies [1f6f3db6]
- Updated dependencies [29b75b1e]
  - @graphql-codegen/visitor-plugin-common@1.19.0
  - @graphql-codegen/typescript@1.21.1
  - @graphql-codegen/plugin-helpers@1.18.3

## 1.17.14

### Patch Changes

- 63be0f40: Fix issues with empty interfaces causing syntax issues
- 190482a1: add support for fragment variables
- 142b32b3: @skip, @include directives resolve to optional fields
- 142b32b3: Better support for @skip/@include directives with complex selection sets
- Updated dependencies [63be0f40]
- Updated dependencies [190482a1]
- Updated dependencies [4444348d]
- Updated dependencies [142b32b3]
- Updated dependencies [42213fa0]
  - @graphql-codegen/visitor-plugin-common@1.18.1
  - @graphql-codegen/typescript@1.20.1

## 1.17.13

### Patch Changes

- 64293437: Support for input lists coercion
- Updated dependencies [64293437]
- Updated dependencies [fd5843a7]
- Updated dependencies [d75051f5]
  - @graphql-codegen/visitor-plugin-common@1.17.22

## 1.17.12

### Patch Changes

- 1183d173: Bump all packages to resolve issues with shared dependencies
- Updated dependencies [1183d173]
  - @graphql-codegen/visitor-plugin-common@1.17.20
  - @graphql-codegen/typescript@1.18.1
  - @graphql-codegen/plugin-helpers@1.18.2

## 1.17.11

### Patch Changes

- 7587fda4: When using avoidOptionals config, @skip, @include resolve into MakeMaybe type
- Updated dependencies [99819bf1]
- Updated dependencies [49242c20]
- Updated dependencies [c3b59e81]
  - @graphql-codegen/visitor-plugin-common@1.17.19
  - @graphql-codegen/typescript@1.18.0

## 1.17.10

### Patch Changes

- 475aa9b8: @skip, @include directives resolve to optional fields
- Updated dependencies [faa13973]
  - @graphql-codegen/visitor-plugin-common@1.17.18

## 1.17.9

### Patch Changes

- 612e5e52: Remove broken isTypeOf call (always undefined in graphql-tools v6)
- 0f35e775: Fixed issues with incorrect naming when typesSuffix is used
- Updated dependencies [612e5e52]
- Updated dependencies [9f2a4e2f]
- Updated dependencies [0f35e775]
- Updated dependencies [eaf45d1f]
  - @graphql-codegen/visitor-plugin-common@1.17.17
  - @graphql-codegen/plugin-helpers@1.18.1

## 1.17.8

### Patch Changes

- 1d7c6432: Bump all packages to allow "^" in deps and fix compatibility issues
- 1d7c6432: Bump versions of @graphql-tools/ packages to fix issues with loading schemas and SDL comments
- Updated dependencies [1d7c6432]
- Updated dependencies [1d7c6432]
  - @graphql-codegen/visitor-plugin-common@1.17.13
  - @graphql-codegen/plugin-helpers@1.17.8
  - @graphql-codegen/typescript@1.17.8
