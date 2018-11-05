---
id: index
title: What are Templates?
---

The general purpose of GraphQL Code Generator is to parse GraphQL syntax, transform it into an AST and then output it into desired formats which can vary. Since there can be potentially infinite amount of formats, we can't predict them all. However, some formats are more likely to be used, thus, we've prepared pre-defined code generation templates which are built for these formats.

## Available Predefined Templates

Below is table with lists all available templates which can be installed via NPM, along with a short description. If you're looking for anything specific, we might already have the solution:

| Format                                  | Purpose                                                          | Package Name & Docs                                                                                 |
| --------------------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| TypeScript                              | Generate server-side TypeScript types, and client-side typings   | [`graphql-codegen-typescript-template`](./templates/typescript-typings.md)                         |
| MongoDB TypeScript Models               | Generate server-side TypeScript types, with MongoDB models       | [`graphql-codegen-typescript-mongodb-template`](./templates/mongodb-typescript-models.md)          |
| Apollo Angular                          | Generate TypeScript types, and Apollo Angular Services           | [`graphql-codegen-apollo-angular-template`](./templates/apollo-angular.md)                         |
| React Apollo TypeScript                 | Generate TypeScript types, and React Apollo Components           | [`graphql-codegen-typescript-react-apollo-template`](./templates/react-apollo-typescript.md)       |
| TypeScript modules for `.graphql` files | Generate `declare module` for `.graphql` files                   | [`graphql-codegen-graphql-files-typescript-modules`](./templates/graphql-typescript-modules.md)    |
| TypeScript Resolvers signature          | Generate TypeScript signature for server-side resolvers          | [`graphql-codegen-typescript-resolvers-template`](./templates/typescript-resolvers.md)             |

In addition, you can build your own code generating templates based on your specific needs. For more information, check [this doc page](../custom-codegen/template).

> ⚠ Swift and Flow code generators were deprecated since version `0.5.5` and should be available to use again soon.

> ⚠ GraphQL's directive feature requires you to add GraphQL version `>0.9.4` as a peer dependency.
