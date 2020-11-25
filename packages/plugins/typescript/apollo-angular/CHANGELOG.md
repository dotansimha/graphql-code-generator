# @graphql-codegen/typescript-apollo-angular

## 2.2.0

### Minor Changes

- bd3bd296: Improve DocumentNode optimizations, to reduce bundle size when consumed as pre-compiled

### Patch Changes

- Updated dependencies [99819bf1]
- Updated dependencies [c3b59e81]
  - @graphql-codegen/visitor-plugin-common@1.17.19

## 2.1.0

### Minor Changes

- 7610ce64: add support for importing operations from external file in angular-apollo plugin

### Patch Changes

- Updated dependencies [612e5e52]
- Updated dependencies [9f2a4e2f]
- Updated dependencies [0f35e775]
- Updated dependencies [eaf45d1f]
  - @graphql-codegen/visitor-plugin-common@1.17.17
  - @graphql-codegen/plugin-helpers@1.18.1

## 2.0.1

### Patch Changes

- 1d7c6432: Bump all packages to allow "^" in deps and fix compatibility issues
- 1d7c6432: Bump versions of @graphql-tools/ packages to fix issues with loading schemas and SDL comments
- ac067ea0: Improve output by using gql tag from apollo-angular package, when apollo-angular@v2 is used
- Updated dependencies [1d7c6432]
- Updated dependencies [1d7c6432]
  - @graphql-codegen/visitor-plugin-common@1.17.13
  - @graphql-codegen/plugin-helpers@1.17.8

## 2.0.0

### Major Changes

- bf29f132: Support Apollo Angular 2.0 by default

  ## Breaking Changes

  The default supported version of this plugin is `v2` of `apollo-angular`.

  If you are still using v1, you should add this to your configuration:

  ```yaml
  config:
    apolloAngularVersion: 1
  ```

### Minor Changes

- bf29f132: Allow to define the Injector of the generated SDK class in Apollo Angular plugin

### Patch Changes

- b9113daf: Fix Dependency Injection issue in Apollo Angular when targeting ES5
- Updated dependencies [4266a15f]
  - @graphql-codegen/visitor-plugin-common@1.17.12
