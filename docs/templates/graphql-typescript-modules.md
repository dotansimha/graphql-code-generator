---
id: graphql-typescript-modules
title: GraphQL Typescript Modules Template
---

This template generates TypeScript typings for `.graphql` files containing GraphQL documents, and you can later consume it using [`graphql-tag/loader`](https://github.com/apollographql/graphql-tag#webpack-preprocessing-with-graphql-tagloader), and get type-check and type-safty for your imports. That also means that now when you will import from `.graphql` files, your IDE will provide auto-complete.

This template also handles `.graphql` files containing multiple GraphQL documents, and name the imports according to the operation name.

> Note: Fragments are not generated with named imports, only as defualt imports, due to `graphql-tag/loader` behavior.

### How to use?

Just like any other GraphQL-Code-Generator template, install this template from Npm:

```
yarn add graphql @types/graphql graphql-code-generator graphql-codegen-graphql-files-typescript-modules
```

Then, run the codegen, specify the template, your schema (required for documents validation), and specify your `.graphql` files path:

```
gql-gen --template graphql-codegen-graphql-files-typescript-modules --schema "schema.json" --out src/modules-declarations.d.ts "./src/**/*.graphql"
```

> Make sure to output the file into a directory that included in your TypeScript project, this way TypeScript will pick it up as declaration file. No need to import the generated file, because TypeScript does it automatically for you.

### Requirements

To use this template, make sure you are using [`graphql-tag/loader`](https://github.com/apollographql/graphql-tag#webpack-preprocessing-with-graphql-tagloader) with Webpack, and make sure to install `@types/graphql` package in your project.

### Examples

For example, if you have a query called `MyQuery` in `my-query.graphql`, this template will generate the following code:

```typescript
declare module '*/my-query.graphql' {
  import { DocumentNode } from 'graphql';
  const MyQuery: DocumentNode;

  export { MyQuery };

  export default defaultDocument;
}
```

Later, in your code, you can use default import, or named imports:

```ts
import myQuery from './my-query.graphql';

// OR

import { myQuery } from './my-query.graphql';
```

