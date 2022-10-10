# @graphql-codegen/client-preset

## 1.0.5

### Patch Changes

- [#8457](https://github.com/dotansimha/graphql-code-generator/pull/8457) [`126194017`](https://github.com/dotansimha/graphql-code-generator/commit/1261940173b8266d17fa03c1775104aff6086d3c) Thanks [@charlypoly](https://github.com/charlypoly)! - typo in config mapping

## 1.0.4

### Patch Changes

- [#8455](https://github.com/dotansimha/graphql-code-generator/pull/8455) [`d19573d88`](https://github.com/dotansimha/graphql-code-generator/commit/d19573d889513abab77a99d5f75f25612a891446) Thanks [@charlypoly](https://github.com/charlypoly)! - The client preset now allows the use of the following `config`:
  - `scalars`
  - `defaultScalarType`
  - `strictScalars`
  - `namingConvention`
  - `useTypeImports`
  - `skipTypename`
  - `arrayInputCoercion`

## 1.0.3

### Patch Changes

- [#8443](https://github.com/dotansimha/graphql-code-generator/pull/8443) [`e2d115146`](https://github.com/dotansimha/graphql-code-generator/commit/e2d11514695ca56674983e8b3b7549cd3b440a5d) Thanks [@charlypoly](https://github.com/charlypoly)! - fix(gql-tag-operations): issues with "no documents" scenario

- Updated dependencies [[`e2d115146`](https://github.com/dotansimha/graphql-code-generator/commit/e2d11514695ca56674983e8b3b7549cd3b440a5d)]:
  - @graphql-codegen/gql-tag-operations@1.5.3

## 1.0.2

### Patch Changes

- [#8402](https://github.com/dotansimha/graphql-code-generator/pull/8402) [`a76c606e3`](https://github.com/dotansimha/graphql-code-generator/commit/a76c606e3b631ef903d4066e2643bc7f95457e30) Thanks [@charlypoly](https://github.com/charlypoly)! - dependencies updates:

  - Updated dependency [`@graphql-codegen/gql-tag-operations@1.5.1` ↗︎](https://www.npmjs.com/package/@graphql-codegen/gql-tag-operations/v/1.5.1) (from `^1.5.0`, in `dependencies`)

- [#8402](https://github.com/dotansimha/graphql-code-generator/pull/8402) [`a76c606e3`](https://github.com/dotansimha/graphql-code-generator/commit/a76c606e3b631ef903d4066e2643bc7f95457e30) Thanks [@charlypoly](https://github.com/charlypoly)! - update `@graphql-codegen/gql-tag-operations`

- Updated dependencies [[`a76c606e3`](https://github.com/dotansimha/graphql-code-generator/commit/a76c606e3b631ef903d4066e2643bc7f95457e30)]:
  - @graphql-codegen/gql-tag-operations@1.5.2

## 1.0.1

### Patch Changes

- [#8302](https://github.com/dotansimha/graphql-code-generator/pull/8302) [`876844e76`](https://github.com/dotansimha/graphql-code-generator/commit/876844e7644a917172f09b3c4eb54a2f4c90e4c6) Thanks [@charlypoly](https://github.com/charlypoly)! - **`@graphql-codegen/gql-tag-operations` and `@graphql-codegen/gql-tag-operations-preset`**

  Introduce a `gqlTagName` configuration option

  ***

  **`@graphql-codegen/client-preset`**

  New preset for GraphQL Code Generator v3, more information on the RFC: https://github.com/dotansimha/graphql-code-generator/issues/8296

  ***

  **`@graphql-codegen/cli`**

  Update init wizard with 3.0 recommendations (`codegen.ts`, `client` preset)

- Updated dependencies [[`876844e76`](https://github.com/dotansimha/graphql-code-generator/commit/876844e7644a917172f09b3c4eb54a2f4c90e4c6)]:
  - @graphql-codegen/gql-tag-operations@1.5.0
