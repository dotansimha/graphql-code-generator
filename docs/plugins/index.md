---
id: index
title: What are Plugins?
---

The general purpose of GraphQL Code Generator is to parse GraphQL syntax, transform it into an AST and then output it into desired formats which can vary. Since there can be potentially infinite amount of formats, we can't predict them all. However, some formats are more likely to be used, thus, we've prepared pre-defined code generation plugins which are built for these formats.

## Available Plugins

Below is table with lists all available plugins which can be installed via NPM, along with a short description. If you're looking for anything specific, we might already have the solution:

| Format                           | Purpose                                                             | Package Name & Docs                                                                                 |
| -------------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| TypeScript Common                | Generate server-side TypeScript types, and client-side typings      | [`graphql-codegen-typescript-common`](./plugins/typescript-common.md)                               |
| TypeScript Client                | Generate client specific TypeScript types                           | [`graphql-codegen-typescript-client`](./plugins/typescript-client.md)                               |
| TypeScript Server                | Generate server specific TypeScript types                           | [`graphql-codegen-typescript-server`](./plugins/typescript-server.md)                               |
| TypeScript Resolvers             | Generate TypeScript signature for server-side resolvers             | [`graphql-codegen-typescript-resolvers`](./plugins/typescript-resolvers.md)                         |
| TypeScript Apollo Angular        | Generate TypeScript types, and Apollo Angular Services              | [`graphql-codegen-typescript-apollo-angular`](./plugins/typescript-apollo-angular.md)               |
| TypeScript React Apollo          | Generate TypeScript types, and React Apollo Components              | [`graphql-codegen-typescript-react-apollo`](./plugins/typescript-react-apollo.md)                   |
| TypeScript MongoDB               | Generate Generate server-side TypeScript types, with MongoDB models | [`graphql-codegen-typescript-mongodb`](./plugins/typescript-mongodb.md)                             |
| TypeScript GraphQL Files Modules | Generate `declare module` for `.graphql` files                      | [`graphql-codegen-typescript-graphql-files-modules`](./plugins/typescript-graphql-files-modules.md) |

In addition, you can build your own code generating plugins based on your specific needs. For more information, check [this doc page](../custom-codegen/plugin).

> ⚠ Swift and Flow code generators were deprecated since version `0.5.5` and should be available to use again soon.

> ⚠ GraphQL's directive feature requires you to add GraphQL version `>0.9.4` as a peer dependency.
