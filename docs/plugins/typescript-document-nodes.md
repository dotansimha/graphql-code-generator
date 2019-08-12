---
id: typescript-document-nodes
title: TypeScript document nodes
---

This is a plugin for [GraphQL Code
Generator](https://graphql-code-generator.com/) that generates TypeScript
source file from GraphQL files.

Generated modules export GraphQL as an AST document nodes. Modules use
[`graphql-tag`](https://www.npmjs.com/package/graphql-tag) module.

## Installation

    $ yarn add @graphql-codegen/typescript-document-nodes

## Usage

With [GitHub GraphQL API v4](https://developer.github.com/v4/) schema and
following GraphQL operation:

```graphql
query Viewer {
  viewer {
    login
    name
  }
}
```

It will generate following TypeScript code:

```ts
import { DocumentNode } from 'graphql';
import gql from 'graphql-tag';

export const viewerQuery: DocumentNode = gql`
  query Viewer {
    viewer {
      login
      name
    }
  }
`;
```

## Configuration

{@import: ../docs/generated-config/base-visitor.md}
{@import: ../docs/generated-config/typescript-document-nodes.md}
