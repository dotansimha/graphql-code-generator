---
id: relay-operation-optimizer
title: Relay Operation Optimizer
---

_Built and maintained by [n1ru4l](https://github.com/n1ru4l)_

A GraphQL Codegen feature for bringing the benefits of Relay Compiler to any GraphQL Client using [Relay Operation Optimizer](https://www.graphql-tools.com/docs/relay-operation-optimizer)

You can test how relay-compiler affects your queries over on the [Relay Compiler REPL](https://relay-compiler-repl.netlify.com/).

## List of Features

- [Optimize your Operations](https://relay.dev/docs/en/compiler-architecture#transforms) TL;DR: reduce operation complexity and size
  - Inline Fragments
  - Flatten Transform
  - Skip Redundant Node Transform
- FragmentArguments TL;DR: Make your fragments reusable with different arguments
  - [`@argumentsDefinition`](https://relay.dev/docs/en/graphql-in-relay#argumentdefinitions)
  - [`@arguments`](https://relay.dev/docs/en/graphql-in-relay#arguments)

## Usage

Set up your project per the GraphQL Codegen Docs, and add `flattenGeneratedTypes: true` in your codegen.yml:

```yaml
overwrite: true
schema: schema.graphql
generates:
  src/generated-types.tsx:
    documents: 'src/documents/**/*.graphql'
    config:
      skipDocumentsValidation: true
      flattenGeneratedTypes: true
    plugins:
      - 'typescript'
      - 'typescript-operations'
      - 'typescript-react-apollo'
```

Please notice that you have to skip the document validation - but no worries, relay-compiler will validate your documents instead!

> [See Laurin Quast's blog post to learn how to use those directives in your operations](https://the-guild.dev/blog/graphql-codegen-relay-compiler)
