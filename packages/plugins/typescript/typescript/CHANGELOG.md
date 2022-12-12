# @graphql-codegen/typescript

## 2.8.5

### Patch Changes

- [`46f75304a`](https://github.com/dotansimha/graphql-code-generator/commit/46f75304a69a13e8b5f58303f65c81b30a2ad96a) Thanks [@saihaj](https://github.com/saihaj)! - fix the version of `@graphql-codegen/plugin-helpers@3.1.1`

- Updated dependencies [[`fedd71cbb`](https://github.com/dotansimha/graphql-code-generator/commit/fedd71cbb7f37440a59032d942cb228df78d52e5), [`307a5d350`](https://github.com/dotansimha/graphql-code-generator/commit/307a5d350643dd065d228b04ef3b4bd70cac0e81), [`46f75304a`](https://github.com/dotansimha/graphql-code-generator/commit/46f75304a69a13e8b5f58303f65c81b30a2ad96a)]:
  - @graphql-codegen/schema-ast@2.6.0
  - @graphql-codegen/plugin-helpers@3.1.1
  - @graphql-codegen/visitor-plugin-common@2.13.5

## 2.8.4

### Patch Changes

- Updated dependencies [[`a6c2097f4`](https://github.com/dotansimha/graphql-code-generator/commit/a6c2097f4789c0cce4296ce349790ce29943ed22), [`a6c2097f4`](https://github.com/dotansimha/graphql-code-generator/commit/a6c2097f4789c0cce4296ce349790ce29943ed22), [`f79a00e8a`](https://github.com/dotansimha/graphql-code-generator/commit/f79a00e8ae073eab426ca08795c924e716123482), [`c802a0c0b`](https://github.com/dotansimha/graphql-code-generator/commit/c802a0c0b775cfabc5ace3e7fb6655540c6c4d84)]:
  - @graphql-codegen/plugin-helpers@3.0.0
  - @graphql-codegen/visitor-plugin-common@2.13.4
  - @graphql-codegen/schema-ast@2.5.2

## 2.8.3

### Patch Changes

- Updated dependencies [[`62f655452`](https://github.com/dotansimha/graphql-code-generator/commit/62f6554520955dd675e11c920f35ef9bf0aaeffe)]:
  - @graphql-codegen/visitor-plugin-common@2.13.3

## 2.8.2

### Patch Changes

- [#8586](https://github.com/dotansimha/graphql-code-generator/pull/8586) [`ef4c2c9c2`](https://github.com/dotansimha/graphql-code-generator/commit/ef4c2c9c233c68830f10eb4c167c7cceead27122) Thanks [@levrik](https://github.com/levrik)! - Fix incompatibility between `@oneOf` input types and declaration kind other than `type`

- Updated dependencies [[`ef4c2c9c2`](https://github.com/dotansimha/graphql-code-generator/commit/ef4c2c9c233c68830f10eb4c167c7cceead27122)]:
  - @graphql-codegen/visitor-plugin-common@2.13.2

## 2.8.1

### Patch Changes

- Updated dependencies [[`63dc8f205`](https://github.com/dotansimha/graphql-code-generator/commit/63dc8f2054e27b944f7d8dc59db8afa85760a127)]:
  - @graphql-codegen/visitor-plugin-common@2.13.1
  - @graphql-codegen/plugin-helpers@2.7.2

## 2.8.0

### Minor Changes

- [#8390](https://github.com/dotansimha/graphql-code-generator/pull/8390) [`12ecbe067`](https://github.com/dotansimha/graphql-code-generator/commit/12ecbe067b37c340ffef99b96d487931be260f69) Thanks [@Diizzayy](https://github.com/Diizzayy)! - handle undefined namedType when including introspection type definitions

## 2.7.5

### Patch Changes

- Updated dependencies [[`a46b8d99c`](https://github.com/dotansimha/graphql-code-generator/commit/a46b8d99c797283d773ec14163c62be9c84d4c2b)]:
  - @graphql-codegen/visitor-plugin-common@2.13.0

## 2.7.4

### Patch Changes

- Updated dependencies [[`1bd7f771c`](https://github.com/dotansimha/graphql-code-generator/commit/1bd7f771ccb949a5a37395c7c57cb41c19340714)]:
  - @graphql-codegen/visitor-plugin-common@2.12.2

## 2.7.3

### Patch Changes

- [#8189](https://github.com/dotansimha/graphql-code-generator/pull/8189) [`b408f8238`](https://github.com/dotansimha/graphql-code-generator/commit/b408f8238c00bbb4cd448501093856c06cfde50f) Thanks [@n1ru4l](https://github.com/n1ru4l)! - Fix CommonJS TypeScript resolution with `moduleResolution` `node16` or `nodenext`

- Updated dependencies [[`b408f8238`](https://github.com/dotansimha/graphql-code-generator/commit/b408f8238c00bbb4cd448501093856c06cfde50f), [`47d0a57e2`](https://github.com/dotansimha/graphql-code-generator/commit/47d0a57e27dd0d2334670bfc6c81c45e00ff4e74)]:
  - @graphql-codegen/schema-ast@2.5.1
  - @graphql-codegen/visitor-plugin-common@2.12.1
  - @graphql-codegen/plugin-helpers@2.6.2

## 2.7.2

### Patch Changes

- Updated dependencies [2cbcbb371]
  - @graphql-codegen/visitor-plugin-common@2.12.0
  - @graphql-codegen/plugin-helpers@2.6.0

## 2.7.1

### Patch Changes

- Updated dependencies [525ad580b]
  - @graphql-codegen/visitor-plugin-common@2.11.1

## 2.7.0

### Minor Changes

- d84afec09: Support TypeScript ESM modules (`"module": "node16"` and `"moduleResolution": "node16"`).

  [More information on the TypeScript Release Notes.](https://devblogs.microsoft.com/typescript/announcing-typescript-4-7/#ecmascript-module-support-in-node-js)

### Patch Changes

- Updated dependencies [68bb30e19]
- Updated dependencies [d84afec09]
- Updated dependencies [a4fe5006b]
- Updated dependencies [8e44df58b]
  - @graphql-codegen/visitor-plugin-common@2.11.0
  - @graphql-codegen/schema-ast@2.5.0
  - @graphql-codegen/plugin-helpers@2.5.0

## 2.6.0

### Minor Changes

- aa1e6eafd: Add @Deprecated support for input

### Patch Changes

- 8b10f22be: Ensure falsy enum values are still mapped
- Updated dependencies [aa1e6eafd]
- Updated dependencies [a42fcbfe4]
- Updated dependencies [8b10f22be]
  - @graphql-codegen/visitor-plugin-common@2.10.0

## 2.5.1

### Patch Changes

- Updated dependencies [d16bebacb]
  - @graphql-codegen/visitor-plugin-common@2.9.1

## 2.5.0

### Minor Changes

- c3d7b7226: support the `@oneOf` directive on input types.

### Patch Changes

- Updated dependencies [c3d7b7226]
  - @graphql-codegen/visitor-plugin-common@2.9.0

## 2.4.11

### Patch Changes

- Updated dependencies [f1fb77bd4]
  - @graphql-codegen/visitor-plugin-common@2.8.0

## 2.4.10

### Patch Changes

- 9a5f31cb6: New option `onlyEnums` for Typescript
- Updated dependencies [9a5f31cb6]
  - @graphql-codegen/visitor-plugin-common@2.7.6

## 2.4.9

### Patch Changes

- Updated dependencies [2966686e9]
  - @graphql-codegen/visitor-plugin-common@2.7.5

## 2.4.8

### Patch Changes

- Updated dependencies [337fd4f77]
  - @graphql-codegen/visitor-plugin-common@2.7.4

## 2.4.7

### Patch Changes

- 54718c039: Improve @Deprecated Enum Type developer experience
- Updated dependencies [54718c039]
  - @graphql-codegen/visitor-plugin-common@2.7.3

## 2.4.6

### Patch Changes

- Updated dependencies [11d05e361]
  - @graphql-codegen/visitor-plugin-common@2.7.2

## 2.4.5

### Patch Changes

- Updated dependencies [fd55e2039]
  - @graphql-codegen/visitor-plugin-common@2.7.1

## 2.4.4

### Patch Changes

- Updated dependencies [1479233df]
  - @graphql-codegen/visitor-plugin-common@2.7.0

## 2.4.3

### Patch Changes

- Updated dependencies [c8ef37ae0]
- Updated dependencies [754a33715]
- Updated dependencies [bef4376d5]
- Updated dependencies [be7cb3a82]
  - @graphql-codegen/visitor-plugin-common@2.6.0
  - @graphql-codegen/plugin-helpers@2.4.0

## 2.4.2

### Patch Changes

- 6002feb3d: Fix exports in package.json files for react-native projects
- Updated dependencies [6002feb3d]
  - @graphql-codegen/schema-ast@2.4.1
  - @graphql-codegen/visitor-plugin-common@2.5.2
  - @graphql-codegen/plugin-helpers@2.3.2

## 2.4.1

### Patch Changes

- Updated dependencies [a9f1f1594]
- Updated dependencies [9ea6621ec]
  - @graphql-codegen/visitor-plugin-common@2.5.1

## 2.4.0

### Minor Changes

- 4c5c84c1b: Added InputMaybe, a different type of Maybe type for input/arguments

## 2.3.1

### Patch Changes

- 6c898efe5: list all dependencies used by the package in the package.json
- Updated dependencies [f3833243d]
- Updated dependencies [6c898efe5]
  - @graphql-codegen/schema-ast@2.4.0

## 2.3.0

### Minor Changes

- 97ddb487a: feat: GraphQL v16 compatibility

### Patch Changes

- Updated dependencies [97ddb487a]
  - @graphql-codegen/visitor-plugin-common@2.5.0
  - @graphql-codegen/plugin-helpers@2.3.0

## 2.2.4

### Patch Changes

- Updated dependencies [ad02cb9b8]
  - @graphql-codegen/visitor-plugin-common@2.4.0

## 2.2.3

### Patch Changes

- Updated dependencies [b9e85adae]
- Updated dependencies [7c60e5acc]
- Updated dependencies [3c2c847be]
  - @graphql-codegen/visitor-plugin-common@2.3.0
  - @graphql-codegen/plugin-helpers@2.2.0

## 2.2.2

### Patch Changes

- Updated dependencies [0b090e31a]
  - @graphql-codegen/visitor-plugin-common@2.2.1

## 2.2.1

### Patch Changes

- cfa0a8f80: Apply missing namingConvention when numericEnums is used

## 2.2.0

### Minor Changes

- d6c2d4c09: Allow declaring Argument and InputType field mappings based on directive annotations.

  **WARNING:** Using this option does only change the type definitions.

  For actually ensuring that a type is correct at runtime you will have to use schema transforms (e.g. with [@graphql-tools/utils mapSchema](https://www.graphql-tools.com/docs/schema-directives)) that apply those rules! Otherwise, you might end up with a runtime type mismatch which could cause unnoticed bugs or runtime errors.

  Please use this configuration option with care!

  ```yaml
  plugins:
    config:
      directiveArgumentAndInputFieldMappings:
        asNumber: number
  ```

  ```graphql
  directive @asNumber on ARGUMENT_DEFINITION | INPUT_FIELD_DEFINITION

  input MyInput {
    id: ID! @asNumber
  }

  type User {
    id: ID!
  }

  type Query {
    user(id: ID! @asNumber): User
  }
  ```

  Usage e.g. with `typescript-resolvers`

  ```ts
  const Query: QueryResolvers = {
    user(_, args) {
      // args.id is of type 'number'
    },
  };
  ```

- 8261e4161: Make futureProofEnums option work for all enum output types, (it worked only with enumsAsTypes)

### Patch Changes

- Updated dependencies [d6c2d4c09]
- Updated dependencies [feeae1c66]
- Updated dependencies [5086791ac]
  - @graphql-codegen/visitor-plugin-common@2.2.0

## 2.1.2

### Patch Changes

- Updated dependencies [6470e6cc9]
- Updated dependencies [263570e50]
- Updated dependencies [35199dedf]
  - @graphql-codegen/visitor-plugin-common@2.1.2
  - @graphql-codegen/plugin-helpers@2.1.1

## 2.1.1

### Patch Changes

- Updated dependencies [aabeff181]
  - @graphql-codegen/visitor-plugin-common@2.1.1

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
  - @graphql-codegen/plugin-helpers@2.0.0

## 1.23.0

### Minor Changes

- 9005cc17: add `allowEnumStringTypes` option for allowing string literals as valid return types from resolvers in addition to enum values.\_

### Patch Changes

- Updated dependencies [df19a4ed]
- Updated dependencies [470336a1]
- Updated dependencies [9005cc17]
  - @graphql-codegen/visitor-plugin-common@1.22.0
  - @graphql-codegen/plugin-helpers@1.18.8

## 1.22.4

### Patch Changes

- Updated dependencies [6762aff5]
  - @graphql-codegen/visitor-plugin-common@1.21.3

## 1.22.3

### Patch Changes

- Updated dependencies [6aaecf1c]
  - @graphql-codegen/visitor-plugin-common@1.21.2

## 1.22.2

### Patch Changes

- Updated dependencies [cf1e5abc]
  - @graphql-codegen/visitor-plugin-common@1.21.1

## 1.22.1

### Patch Changes

- Updated dependencies [dfd25caf]
- Updated dependencies [8da7dff6]
  - @graphql-codegen/visitor-plugin-common@1.21.0
  - @graphql-codegen/plugin-helpers@1.18.7

## 1.22.0

### Minor Changes

- f0b5ea53: Add entireFieldWrapperValue configuration option, to wrap arrays
- 097bea2f: Added new configuration settings for scalars: `strictScalars` and `defaultScalarType`

### Patch Changes

- d9212aa0: fix(visitor-plugin-common): guard for a runtime type error
- Updated dependencies [d9212aa0]
- Updated dependencies [f0b5ea53]
- Updated dependencies [097bea2f]
  - @graphql-codegen/visitor-plugin-common@1.20.0
  - @graphql-codegen/plugin-helpers@1.18.5

## 1.21.1

### Patch Changes

- e947f8e3: Allow to have declarationKind of type: class, interface: interface
- 29b75b1e: enhance(namingConvention): use change-case-all instead of individual packages for naming convention
- Updated dependencies [e947f8e3]
- Updated dependencies [29b75b1e]
- Updated dependencies [d4942d04]
- Updated dependencies [1f6f3db6]
- Updated dependencies [29b75b1e]
  - @graphql-codegen/visitor-plugin-common@1.19.0
  - @graphql-codegen/plugin-helpers@1.18.3

## 1.21.0

### Minor Changes

- 34b8087e: Adds futureProofUnion option to account for a possible unknown new type added to union types

### Patch Changes

- Updated dependencies [5749cb8a]
- Updated dependencies [5a12fe58]
  - @graphql-codegen/visitor-plugin-common@1.18.3

## 1.20.2

### Patch Changes

- ca66569f: Fix issues with undefined calls for str.replace
- Updated dependencies [ca66569f]
  - @graphql-codegen/visitor-plugin-common@1.18.2

## 1.20.1

### Patch Changes

- 4444348d: Correctly escape enum values defined in the GraphQLSchema object
- Updated dependencies [63be0f40]
- Updated dependencies [190482a1]
- Updated dependencies [4444348d]
- Updated dependencies [142b32b3]
- Updated dependencies [42213fa0]
  - @graphql-codegen/visitor-plugin-common@1.18.1

## 1.20.0

### Minor Changes

- d95db95b: feat(typescript): bump visitor-plugin-common

## 1.19.0

### Minor Changes

- 1d6a593f: Added `useImplementingTypes` flag for generating code that uses implementing types instead of interfaces

### Patch Changes

- Updated dependencies [8356f8a2]
  - @graphql-codegen/visitor-plugin-common@1.17.21

## 1.18.1

### Patch Changes

- 1183d173: Bump all packages to resolve issues with shared dependencies
- Updated dependencies [1183d173]
  - @graphql-codegen/visitor-plugin-common@1.17.20
  - @graphql-codegen/plugin-helpers@1.18.2

## 1.18.0

### Minor Changes

- 49242c20: Added a "defaultValue" option in the "avoidOptionals" config
  See https://github.com/dotansimha/graphql-code-generator/issues/5112

### Patch Changes

- Updated dependencies [99819bf1]
- Updated dependencies [c3b59e81]
  - @graphql-codegen/visitor-plugin-common@1.17.19

## 1.17.11

### Patch Changes

- 077cf064: Fixed reading of enumValues config values
- 92d8f876: Fixed unquoted numeric enum identifiers
- Updated dependencies [92d8f876]
  - @graphql-codegen/visitor-plugin-common@1.17.16

## 1.17.10

### Patch Changes

- 7ad7a1ae: Make non nullable input field with default value optional
- Updated dependencies [d2cde3d5]
- Updated dependencies [89a6aa80]
- Updated dependencies [f603b8f8]
- Updated dependencies [da8bdd17]
  - @graphql-codegen/visitor-plugin-common@1.17.15
  - @graphql-codegen/plugin-helpers@1.17.9

## 1.17.9

### Patch Changes

- 07f9b1b2: Fix a bug caused numeric enum values defined in the GraphQLSchema to be printed incorrectly
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
