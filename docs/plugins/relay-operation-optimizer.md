---
id: relay-operation-optimizer
title: Relay Operation Optimizer.
---

_Built and maintained by [n1ru4l](https://github.com/n1ru4l)_

A GraphQL Codegen Plugin for bringing the benefits of Relay Compiler to any GraphQL Client.

You can test how relay-compiler affects your queries over on the [Relay Compiler REPL](https://relay-compiler-repl.netlify.com/).

## List of Features

- [Optimize your Operations](https://relay.dev/docs/en/compiler-architecture#transforms) TL;DR: reduce operation complexity and size
  - Inline Fragments
  - Flatten Transform
  - Skip Redundant Node Transform
- FragmentArguments TL;DR: Make your fragments reusable with different arguments
  - [`@argumentsDefinition`](https://relay.dev/docs/en/graphql-in-relay#argumentdefinitions)
  - [`@arguments`](https://relay.dev/docs/en/graphql-in-relay#arguments)

## Installation

```shell
yarn add -D @graphql-codegen/relay-operation-optimizer
```

## Usage

Set up your project per the GraphQL Codegen Docs, and specify this plugin in your codegen.yml:

```yaml
overwrite: true
schema: schema.graphql
generates:
  src/generated-types.tsx:
    documents: 'src/documents/**/*.graphql'
    config:
      skipDocumentsValidation: true
    plugins:
      - 'relay-operation-optimizer'
      - 'typescript'
      - 'typescript-operations'
      - 'typescript-react-apollo'
```

Please notice that you have to skip the document validation - but no worries, relay-compiler will validate your documents instead!
