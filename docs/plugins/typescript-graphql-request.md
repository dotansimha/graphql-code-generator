---
id: typescript-graphql-request
title: TypeScript GraphQL-Request
---

This plugin generates [`graphql-request`](https://www.npmjs.com/package/graphql-request) ready-to-use SDK, which is fully-typed.

{@import: ../docs/plugins/client-note.md}

## Installation

[You can find a working example with this plugin here](https://github.com/dotansimha/graphql-codegen-graphql-request-example)

    $ yarn add @graphql-codegen/typescript @graphql-codegen/typescript-operations @graphql-codegen/typescript-graphql-request

The, make sure you have `typescript` plugin and `typescript-operations` as well in your configuration:

```yml
schema: https://countries.trevorblades.com/
documents: 'src/graphql/**/*.graphql'
generates:
  src/sdk.ts:
    plugins:
      - typescript
      - typescript-operations
      - typescript-graphql-request
```

## Usage

For the given input:

```graphql
query continents {
  continents {
    name
    countries {
      ...CountryFields
    }
  }
}
fragment CountryFields on Country {
  name
  currency
}
```

It generates SDK you can import and wrap your `GraphQLClient` instance, and get fully-typed SDK based on your operations:

```ts
import { GraphQLClient } from 'graphql-request';
import { getSdk } from './sdk'; // THIS FILE IS THE GENERATED FILE

async function main() {
  const client = new GraphQLClient('https://countries.trevorblades.com/');
  const sdk = getSdk(client);
  const { continents } = await sdk.continents(); // This is fully typed, based on the query

  console.log(`GraphQL data:`, continents);
}
```

## Configuration

{@import: ../docs/generated-config/base-visitor.md}
{@import: ../docs/generated-config/client-side-base-visitor.md}
