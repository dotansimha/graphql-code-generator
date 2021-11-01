# @graphql-codegen/typescript-resolvers

## 2.4.0

### Minor Changes

- 97ddb487a: feat: GraphQL v16 compatibility

### Patch Changes

- Updated dependencies [97ddb487a]
  - @graphql-codegen/visitor-plugin-common@2.5.0
  - @graphql-codegen/typescript@2.3.0
  - @graphql-codegen/plugin-helpers@2.3.0

## 2.3.2

### Patch Changes

- Updated dependencies [ad02cb9b8]
  - @graphql-codegen/visitor-plugin-common@2.4.0
  - @graphql-codegen/typescript@2.2.4

## 2.3.1

### Patch Changes

- Updated dependencies [b9e85adae]
- Updated dependencies [7c60e5acc]
- Updated dependencies [3c2c847be]
  - @graphql-codegen/visitor-plugin-common@2.3.0
  - @graphql-codegen/plugin-helpers@2.2.0
  - @graphql-codegen/typescript@2.2.3

## 2.3.0

### Minor Changes

- 46b38d9c1: Add makeResolverTypeCallable property to config which allows a resolver function to be called

## 2.2.1

### Patch Changes

- Updated dependencies [0b090e31a]
  - @graphql-codegen/visitor-plugin-common@2.2.1
  - @graphql-codegen/typescript@2.2.2

## 2.2.0

### Minor Changes

- 5086791ac: Allow overwriting the resolver type signature based on directive usages.

  **WARNING:** Using this option does only change the generated type definitions.

  For actually ensuring that a type is correct at runtime you will have to use schema transforms (e.g. with [@graphql-tools/utils mapSchema](https://www.graphql-tools.com/docs/schema-directives)) that apply those rules! Otherwise, you might end up with a runtime type mismatch which could cause unnoticed bugs or runtime errors.

  Example configuration:

  ```yml
  config:
    # This was possible before
    customResolverFn: ../resolver-types.ts#UnauthenticatedResolver
    # This is new
    directiveResolverMappings:
      authenticated: ../resolvers-types.ts#AuthenticatedResolver
  ```

  Example mapping file (`resolver-types.ts`):

  ```ts
  export type UnauthenticatedContext = {
    user: null;
  };

  export type AuthenticatedContext = {
    user: { id: string };
  };

  export type UnauthenticatedResolver<TResult, TParent, _TContext, TArgs> = (
    parent: TParent,
    args: TArgs,
    context: UnauthenticatedContext,
    info: GraphQLResolveInfo
  ) => Promise<TResult> | TResult;

  export type AuthenticatedResolver<TResult, TParent, _TContext, TArgs> = (
    parent: TParent,
    args: TArgs,
    context: AuthenticatedContext,
    info: GraphQLResolveInfo
  ) => Promise<TResult> | TResult;
  ```

  Example Schema:

  ```graphql
  directive @authenticated on FIELD_DEFINITION

  type Query {
    yee: String
    foo: String @authenticated
  }
  ```

### Patch Changes

- Updated dependencies [d6c2d4c09]
- Updated dependencies [feeae1c66]
- Updated dependencies [8261e4161]
- Updated dependencies [5086791ac]
  - @graphql-codegen/visitor-plugin-common@2.2.0
  - @graphql-codegen/typescript@2.2.0

## 2.1.2

### Patch Changes

- Updated dependencies [6470e6cc9]
- Updated dependencies [263570e50]
- Updated dependencies [35199dedf]
  - @graphql-codegen/visitor-plugin-common@2.1.2
  - @graphql-codegen/plugin-helpers@2.1.1
  - @graphql-codegen/typescript@2.1.2

## 2.1.1

### Patch Changes

- Updated dependencies [aabeff181]
  - @graphql-codegen/visitor-plugin-common@2.1.1
  - @graphql-codegen/typescript@2.1.1

## 2.1.0

### Minor Changes

- 39773f59b: enhance(plugins): use getDocumentNodeFromSchema and other utilities from @graphql-tools/utils
- 440172cfe: support ESM

### Patch Changes

- 24185985a: bump graphql-tools package versions
- 440172cfe: export config types
- Updated dependencies [290170262]
- Updated dependencies [24185985a]
- Updated dependencies [39773f59b]
- Updated dependencies [440172cfe]
  - @graphql-codegen/visitor-plugin-common@2.1.0
  - @graphql-codegen/plugin-helpers@2.1.0
  - @graphql-codegen/typescript@2.1.0

## 2.0.0

### Major Changes

- d80efdec4: Set `noSchemaStitching: true` by default.

  If you need the resolvers signature to support schema-stitching, please add to your config:

  ```yml
  noSchemaStitching: false
  ```

- d80efdec4: Remove deprecated `IDirectiveResolvers` and `IResolvers` signatures

  Please use `DirectiveResolvers` and `Resolvers` types instead.

- b0cb13df4: Update to latest `graphql-tools` and `graphql-config` version.

  ‼️ ‼️ ‼️ Please note ‼️ ‼️ ‼️:

  This is a breaking change since Node 10 is no longer supported in `graphql-tools`, and also no longer supported for Codegen packages.

### Patch Changes

- Updated dependencies [d80efdec4]
- Updated dependencies [d80efdec4]
- Updated dependencies [b0cb13df4]
  - @graphql-codegen/visitor-plugin-common@2.0.0
  - @graphql-codegen/typescript@2.0.0
  - @graphql-codegen/plugin-helpers@2.0.0

## 1.20.0

### Minor Changes

- 8e4d5826: Add a new type for StitchResolver without selectionSet
- 9005cc17: add `allowEnumStringTypes` option for allowing string literals as valid return types from resolvers in addition to enum values.\_

### Patch Changes

- df19a4ed: Allow multiple `{T}` instances in defaultMapper
- Updated dependencies [df19a4ed]
- Updated dependencies [470336a1]
- Updated dependencies [9005cc17]
  - @graphql-codegen/visitor-plugin-common@1.22.0
  - @graphql-codegen/plugin-helpers@1.18.8
  - @graphql-codegen/typescript@1.23.0

## 1.19.5

### Patch Changes

- Updated dependencies [6762aff5]
  - @graphql-codegen/visitor-plugin-common@1.21.3
  - @graphql-codegen/typescript@1.22.4

## 1.19.4

### Patch Changes

- Updated dependencies [6aaecf1c]
  - @graphql-codegen/visitor-plugin-common@1.21.2
  - @graphql-codegen/typescript@1.22.3

## 1.19.3

### Patch Changes

- Updated dependencies [cf1e5abc]
  - @graphql-codegen/visitor-plugin-common@1.21.1
  - @graphql-codegen/typescript@1.22.2

## 1.19.2

### Patch Changes

- dfd25caf: chore(deps): bump graphql-tools versions
- Updated dependencies [dfd25caf]
- Updated dependencies [8da7dff6]
  - @graphql-codegen/visitor-plugin-common@1.21.0
  - @graphql-codegen/plugin-helpers@1.18.7
  - @graphql-codegen/typescript@1.22.1

## 1.19.1

### Patch Changes

- d9212aa0: fix(visitor-plugin-common): guard for a runtime type error
- Updated dependencies [d9212aa0]
- Updated dependencies [f0b5ea53]
- Updated dependencies [097bea2f]
  - @graphql-codegen/visitor-plugin-common@1.20.0
  - @graphql-codegen/typescript@1.22.0
  - @graphql-codegen/plugin-helpers@1.18.5

## 1.19.0

### Minor Changes

- d4942d04: NEW CONFIG (`onlyResolveTypeForInterfaces`): Allow to generate only \_\_resolveType for interfaces

### Patch Changes

- 29b75b1e: enhance(namingConvention): use change-case-all instead of individual packages for naming convention
- Updated dependencies [e947f8e3]
- Updated dependencies [29b75b1e]
- Updated dependencies [d4942d04]
- Updated dependencies [1f6f3db6]
- Updated dependencies [29b75b1e]
  - @graphql-codegen/visitor-plugin-common@1.19.0
  - @graphql-codegen/typescript@1.21.1
  - @graphql-codegen/plugin-helpers@1.18.3

## 1.18.2

### Patch Changes

- 5749cb8a: chore: fix type-level incompatibilities of the `avoidOptionals`
- Updated dependencies [34b8087e]
- Updated dependencies [5749cb8a]
- Updated dependencies [5a12fe58]
  - @graphql-codegen/typescript@1.21.0
  - @graphql-codegen/visitor-plugin-common@1.18.3

## 1.18.1

### Patch Changes

- fd5843a7: Fixed a bug where some import namespacing is missed when generating resolver types.
- Updated dependencies [64293437]
- Updated dependencies [fd5843a7]
- Updated dependencies [d75051f5]
  - @graphql-codegen/visitor-plugin-common@1.17.22

## 1.18.0

### Minor Changes

- 8356f8a2: Added a new config flag for customizing `isTypeOf` and `resolveType` prefix (`internalResolversPrefix`)

### Patch Changes

- Updated dependencies [8356f8a2]
- Updated dependencies [1d6a593f]
  - @graphql-codegen/visitor-plugin-common@1.17.21
  - @graphql-codegen/typescript@1.19.0

## 1.17.12

### Patch Changes

- 1183d173: Bump all packages to resolve issues with shared dependencies
- Updated dependencies [1183d173]
  - @graphql-codegen/visitor-plugin-common@1.17.20
  - @graphql-codegen/typescript@1.18.1
  - @graphql-codegen/plugin-helpers@1.18.2

## 1.17.11

### Patch Changes

- faa13973: Fixed issues with mappers setup
- Updated dependencies [faa13973]
  - @graphql-codegen/visitor-plugin-common@1.17.18

## 1.17.10

### Patch Changes

- d2cde3d5: fixed isTypeOf resolvers signature
- 89a6aa80: Fixes issues with typesSuffix and arguments type name
- Updated dependencies [d2cde3d5]
- Updated dependencies [89a6aa80]
- Updated dependencies [f603b8f8]
- Updated dependencies [7ad7a1ae]
- Updated dependencies [da8bdd17]
  - @graphql-codegen/visitor-plugin-common@1.17.15
  - @graphql-codegen/typescript@1.17.10
  - @graphql-codegen/plugin-helpers@1.17.9

## 1.17.9

### Patch Changes

- ed7f6b97: Fix issues with mappers not being applied for interfaces or unions

## 1.17.8

### Patch Changes

- 1d7c6432: Bump all packages to allow "^" in deps and fix compatibility issues
- 1d7c6432: Bump versions of @graphql-tools/ packages to fix issues with loading schemas and SDL comments
- af3803b8: only transform federated parent types when they contain @external directive
- Updated dependencies [1d7c6432]
- Updated dependencies [1d7c6432]
  - @graphql-codegen/visitor-plugin-common@1.17.13
  - @graphql-codegen/plugin-helpers@1.17.8
  - @graphql-codegen/typescript@1.17.8
