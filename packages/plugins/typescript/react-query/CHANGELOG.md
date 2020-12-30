# @graphql-codegen/typescript-react-query

## 1.1.0

### Minor Changes

- b6746105: feat(visitor-plugin-common): add ignoreEnumValuesFromSchema to ignore enum values from GraphQLSchema

### Patch Changes

- Updated dependencies [b6746105]
  - @graphql-codegen/visitor-plugin-common@1.19.0

## 1.0.0

### Major Changes

- b51712c3: - Upgraded react-query to v3
  - Modified generated useQuery hooks to allow passing in of data type to be used with query data selectors
  - Reworked the mutations so that variables are passed in at mutate time and not at instantiation

### Patch Changes

- cda6ded0: Make sure mutation variables are always optional
- d98f5079: Respect typesPrefix for generated types.

  Previously, the prefix was incorrectly applied to runtime hook names.

- Updated dependencies [64293437]
- Updated dependencies [fd5843a7]
- Updated dependencies [d75051f5]
  - @graphql-codegen/visitor-plugin-common@1.17.22

## 0.1.1

### Patch Changes

- 1183d173: Bump all packages to resolve issues with shared dependencies
- Updated dependencies [1183d173]
  - @graphql-codegen/visitor-plugin-common@1.17.20
  - @graphql-codegen/plugin-helpers@1.18.2

## 0.1.0

### Minor Changes

- c3b59e81: NEW PLUGIN!

### Patch Changes

- Updated dependencies [99819bf1]
- Updated dependencies [c3b59e81]
  - @graphql-codegen/visitor-plugin-common@1.17.19
