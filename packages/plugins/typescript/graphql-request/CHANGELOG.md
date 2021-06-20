# @graphql-codegen/typescript-graphql-request

## 3.2.2

### Patch Changes

- Updated dependencies [cf1e5abc]
  - @graphql-codegen/visitor-plugin-common@1.21.1

## 3.2.1

### Patch Changes

- dfd25caf: chore(deps): bump graphql-tools versions
- Updated dependencies [dfd25caf]
- Updated dependencies [8da7dff6]
  - @graphql-codegen/visitor-plugin-common@1.21.0
  - @graphql-codegen/plugin-helpers@1.18.7

## 3.2.0

### Minor Changes

- 9b59605d: feat(typescript-graphql-request): Add enhancements to request middleware function (#5883, #5807) #5884

### Patch Changes

- Updated dependencies [637338cb]
  - @graphql-codegen/plugin-helpers@1.18.6

## 3.1.1

### Patch Changes

- d9212aa0: fix(visitor-plugin-common): guard for a runtime type error
- 74e5afa4: fix(graphql-request): print document for rawRequest if documentMode is not string
- Updated dependencies [d9212aa0]
- Updated dependencies [f0b5ea53]
- Updated dependencies [097bea2f]
  - @graphql-codegen/visitor-plugin-common@1.20.0
  - @graphql-codegen/plugin-helpers@1.18.5

## 3.1.0

### Minor Changes

- af6fb509: Removed the unnecessary call to the print function, since graphql-request would call this function internally if needed.

### Patch Changes

- Updated dependencies [e947f8e3]
- Updated dependencies [29b75b1e]
- Updated dependencies [d4942d04]
- Updated dependencies [1f6f3db6]
- Updated dependencies [29b75b1e]
  - @graphql-codegen/visitor-plugin-common@1.19.0
  - @graphql-codegen/plugin-helpers@1.18.3

## 3.0.2

### Patch Changes

- 387d136f: fix(typescript-graphql-request): declare a peer dependency on graphql-request
- ed8cab50: fix(plugin: graphql-requests): Fix type errors in auto-generated methods
- Updated dependencies [5749cb8a]
- Updated dependencies [5a12fe58]
  - @graphql-codegen/visitor-plugin-common@1.18.3

## 3.0.1

### Patch Changes

- 85ba9f49: Fix for error thrown on anonymous operations
- 4b1ca624: fix(plugin: graphql-requests): Fix argument types in auto-generated methods
- f2e3548a: Added missing import for HeadersInit
- Updated dependencies [63be0f40]
- Updated dependencies [190482a1]
- Updated dependencies [4444348d]
- Updated dependencies [142b32b3]
- Updated dependencies [42213fa0]
  - @graphql-codegen/visitor-plugin-common@1.18.1

## 3.0.0

### Major Changes

- d41904e8: Support passing custom headers per each request method.

  NOTE: This version of this plugin requires you to update to graphql-request > 3.4.0

### Patch Changes

- Updated dependencies [64293437]
- Updated dependencies [fd5843a7]
- Updated dependencies [d75051f5]
  - @graphql-codegen/visitor-plugin-common@1.17.22

## 2.0.3

### Patch Changes

- 1183d173: Bump all packages to resolve issues with shared dependencies
- Updated dependencies [1183d173]
  - @graphql-codegen/visitor-plugin-common@1.17.20
  - @graphql-codegen/plugin-helpers@1.18.2

## 2.0.2

### Patch Changes

- 73442b73: fix grapqhl-request import types
- Updated dependencies [92d8f876]
  - @graphql-codegen/visitor-plugin-common@1.17.16

## 2.0.1

### Patch Changes

- fd96ef29: better integration with importDocumentNodeExternallyFrom
- d4847bfa: Fixes issues with latest graphql-request and rawRequest: true
- Updated dependencies [d2cde3d5]
- Updated dependencies [89a6aa80]
- Updated dependencies [f603b8f8]
- Updated dependencies [da8bdd17]
  - @graphql-codegen/visitor-plugin-common@1.17.15
  - @graphql-codegen/plugin-helpers@1.17.9

## 2.0.0

### Major Changes

- af3803b8: Upgrade generated code to match graphql-request v3.

  - `@graphql-codegen/typescript-graphql-request` @ `v1` => matches `graphql-request` (v1 and v2)
  - `@graphql-codegen/typescript-graphql-request` @ `v2` => matches `graphql-request` (v3)

  ## Breaking Changes

  `v3` of `graphql-request` has changed the path of some files. That means that generated code needs to adjusted.

  The actual change is described here: https://github.com/prisma-labs/graphql-request/issues/186

### Patch Changes

- 1d7c6432: Bump all packages to allow "^" in deps and fix compatibility issues
- 1d7c6432: Bump versions of @graphql-tools/ packages to fix issues with loading schemas and SDL comments
- Updated dependencies [1d7c6432]
- Updated dependencies [1d7c6432]
  - @graphql-codegen/visitor-plugin-common@1.17.13
  - @graphql-codegen/plugin-helpers@1.17.8
