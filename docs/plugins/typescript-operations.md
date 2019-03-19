---
id: typescript-operations
title: Typescript Operations
---

The `@graphql-codegen/typescript-operations` plugin generates TypeScript types based on your `GraphQLSchema` and your GraphQL operations and fragments.

It generates types for your GraphQL documents: Query, Mutation, Subscription and Fragment.

This plugin requires you to use `@graphql-codegen/typescript` as well, because it depends on it's types.

### Installation

    $ yarn add -D @graphql-codegen/typescript-operations

### Configuration

{@import: ../docs/generated-config/base-visitor.md}
{@import: ../docs/generated-config/base-documents-visitor.md}
{@import: ../docs/generated-config/typescript-operations.md}
