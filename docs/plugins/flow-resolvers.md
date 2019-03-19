---
id: flow-resolvers
title: Flow Resolvers
---

The `@graphql-codegen/flow-resolvers` plugin generates resolvers signature based on your `GraphQLSchema`.

It generates types for your entire schema: types, input types, enum, interface, scalar and union.

This plugin requires you to use `@graphql-codegen/flow` as well, because it depends on it's types.

## Installation

    $ yarn add -D @graphql-codegen/flow-resolvers

### Examples

- [Basic Schema Example](https://github.com/dotansimha/graphql-code-generator/blob/master/dev-test/test-schema/flow-types.flow.js)

## Configuration

{@import: ../docs/generated-config/base-visitor.md}
{@import: ../docs/generated-config/base-types-visitor.md}
{@import: ../docs/generated-config/flow-resolvers.md}
