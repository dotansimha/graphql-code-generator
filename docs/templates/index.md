---
id: index
title: What are Templates?
---

The general purpose of GraphQL Code Generator is to parse GraphQL syntax, transform it into an AST and then output it into desired formats which can vary. Since there can be potentially infinite amount of formats, we can't predict them all. However, some formats are more likely to be used, thus, we've prepared pre-defined code generation templates which are built for these formats.

## Available Predefined Templates

Below is table with lists all available templates which can be installed via NPM, along with a short description. If you're looking for anything specific, we might already have the solution:

| Format                                  | Purpose                                                          | Package Name & Docs                                                                                   |
| --------------------------------------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| TypeScript Common                       | Generate server-side TypeScript types, and client-side typings   | [`graphql-codegen-typescript-common`](./templates/typescript-common.md)                               |
| TypeScript Client                       | Generate server-side TypeScript types, and client-side typings   | [`graphql-codegen-typescript-client`](./templates/typescript-client.md)                               |
| TypeScript Server                       | Generate server-side TypeScript types, and client-side typings   | [`graphql-codegen-typescript-server`](./templates/typescript-server.md)                               |
| TypeScript Resolvers                    | Generate server-side TypeScript types, and client-side typings   | [`graphql-codegen-typescript-resolvers`](./templates/typescript-resolvers.md)                         |
| TypeScript Apollo Angular               | Generate server-side TypeScript types, and client-side typings   | [`graphql-codegen-typescript-apollo-angular`](./templates/typescript-apollo-angular.md)               |
| TypeScript React Apollo                 | Generate server-side TypeScript types, and client-side typings   | [`graphql-codegen-typescript-react-apollo`](./templates/typescript-react-apollo.md)                   |
| TypeScript MongoDB                      | Generate server-side TypeScript types, and client-side typings   | [`graphql-codegen-typescript-mongodb`](./templates/typescript-mongodb.md)                             |
| TypeScript GraphQL Files Modules        | Generate server-side TypeScript types, and client-side typings   | [`graphql-codegen-typescript-graphql-files-modules`](./templates/typescript-graphql-files-modules.md) |

In addition, you can build your own code generating templates based on your specific needs. For more information, check [this doc page](../custom-codegen/template).

> ⚠ Swift and Flow code generators were deprecated since version `0.5.5` and should be available to use again soon.

> ⚠ GraphQL's directive feature requires you to add GraphQL version `>0.9.4` as a peer dependency.
