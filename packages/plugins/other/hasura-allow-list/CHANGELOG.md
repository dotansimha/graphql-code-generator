# @graphql-codegen/hasura-allow-list

## 2.0.0

### Major Changes

- [#8242](https://github.com/dotansimha/graphql-code-generator/pull/8242) [`7bee5c597`](https://github.com/dotansimha/graphql-code-generator/commit/7bee5c597466d53152776b1cca9085bd29af00cb) Thanks [@BenoitRanque](https://github.com/BenoitRanque)! - added support for global fragments
  breaking: changed config options to camelCase for consistency

## 1.1.1

### Patch Changes

- [#8189](https://github.com/dotansimha/graphql-code-generator/pull/8189) [`b408f8238`](https://github.com/dotansimha/graphql-code-generator/commit/b408f8238c00bbb4cd448501093856c06cfde50f) Thanks [@n1ru4l](https://github.com/n1ru4l)! - Fix CommonJS TypeScript resolution with `moduleResolution` `node16` or `nodenext`

- Updated dependencies [[`b408f8238`](https://github.com/dotansimha/graphql-code-generator/commit/b408f8238c00bbb4cd448501093856c06cfde50f)]:
  - @graphql-codegen/plugin-helpers@2.6.2

## 1.1.0

### Minor Changes

- d84afec09: Support TypeScript ESM modules (`"module": "node16"` and `"moduleResolution": "node16"`).

  [More information on the TypeScript Release Notes.](https://devblogs.microsoft.com/typescript/announcing-typescript-4-7/#ecmascript-module-support-in-node-js)

### Patch Changes

- Updated dependencies [d84afec09]
- Updated dependencies [a4fe5006b]
- Updated dependencies [8e44df58b]
  - @graphql-codegen/plugin-helpers@2.5.0

## 1.0.1

### Patch Changes

- 7198a3cd3: feat: hasura allow list plugin

## 1.0.0

Initial release. Generate a query_collections.yaml [hasura](https://hasura.io/docs/latest/graphql/cloud/security/allow-lists.html) metadata file based on your graphql queries. Allows automation of the process of keeping allow lists up to date with your front end application.
Skips anonymous operations
