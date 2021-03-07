# @graphql-codegen/typescript-operations

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
