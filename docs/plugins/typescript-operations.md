---
id: typescript-operations
title: Typescript Operations
---

The `graphql-codegen-typescript-operations` plugin generates TypeScript types based on your `GraphQLSchema` and your GraphQL operations and fragments.

It generates types for your GraphQL documents: Query, Mutation, Subscription and Fragment.

This plugin requires you to use `graphql-codegen-typescript` as well, because it depends on it's types.

### Installation

Install using `npm` (or `yarn`):

    $ npm install graphql-codegen-typescript-operations

### Examples

- [Star Wars Schema](https://github.com/dotansimha/graphql-code-generator/blob/master/dev-test/star-wars/types.d.ts#L27)
