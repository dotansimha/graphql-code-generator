---
id: typescript-graphql-files-modules
title: TypeScript GraphQL Files Modules
---

This plugin generates TypeScript typings for `.graphql` files containing GraphQL documents, which later on can be consumed using [`graphql-tag/loader`](https://github.com/apollographql/graphql-tag#webpack-preprocessing-with-graphql-tagloader), and get type-check and type-safety for your imports. This means that any time you import objects from `.graphql` files, your IDE will provide auto-complete.

This plugin also handles `.graphql` files containing multiple GraphQL documents, and name the imports according to the operation name.

> ⚠ Fragments are not generated with named imports, only as default imports, due to `graphql-tag/loader` behavior.

## Pre-Requirements

To use this template, make sure you are using [`graphql-tag/loader`](https://github.com/apollographql/graphql-tag#webpack-preprocessing-with-graphql-tagloader) with Webpack, and make sure to install `@types/graphql` package in your project.

## Installation

Install using `npm` (or `yarn`):

    $ npm install graphql-codegen-typescript-graphql-files-modules

## Example

Given that you have a query named `MyQuery` in `my-query.graphql` file, this template will generate the following code:

```typescript
declare module '*/my-query.graphql' {
  import { DocumentNode } from 'graphql';
  const MyQuery: DocumentNode;

  export { MyQuery };

  export default defaultDocument;
}
```

Accordingly, you can import the generated types and use it in your code:

```ts
import myQuery from './my-query.graphql';

// OR

import { myQuery } from './my-query.graphql';
```
