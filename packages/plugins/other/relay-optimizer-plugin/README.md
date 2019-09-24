# @graphql-codegen/relay-optimizer-plugin

## Description

[GraphQL Codegen Plugin](https://github.com/dotansimha/graphql-code-generator) for bringing the benefits of Relay to GraphQL Codegen.

### Current List of Features

- [Optimize Queries](https://relay.dev/docs/en/compiler-architecture#transforms) TL;DR: reduce query size
  - Inline Fragments
  - Flatten Transform
  - Skip Redundant Node Transform
- FragmentArguments
  - [`@argumentsDefinition`](https://relay.dev/docs/en/graphql-in-relay#argumentdefinitions)
  - [`@arguments`](https://relay.dev/docs/en/graphql-in-relay#arguments)

## Install Instructions

`yarn add -D -E @graphql-codegen/relay-optimizer-plugin`

## Usage Instructions

**codegen.yml**

```yaml
overwrite: true
schema: schema.graphql
generates:
  src/generated-types.tsx:
    documents: 'src/documents/**/*.graphql'
    config:
      skipDocumentsValidation: true
    plugins:
      - 'relay-optimizer-plugin'
      - 'typescript'
      - 'typescript-operations'
      - 'typescript-react-apollo'
```
