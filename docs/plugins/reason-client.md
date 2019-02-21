---
id: reason-client
title: Reason Client
---

_Built and maintained by [kgoggin](https://github.com/kgoggin)_

A plugin for GraphQL Codegen to generate ReasonML types based on your GraphQL schema for use in a client application.

## Installation

Install using npm/yarn:

```shell
yarn add graphql-codegen-reason-client -D
```

## Examples

Set up your project per the GraphQL Codegen Docs, and specify this plugin in your codegen.yml:

```yml
schema: http://path.to.your.app
generates:
  src/GraphQLTypes.re:
    - reason-client
```

## Usage & Documentation

For the complete documentation, please refer to [kgoggin/graphql-codegen-reason](https://github.com/kgoggin/graphql-codegen-reason) repository.
