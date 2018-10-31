---
id: overview
title: Overview
---

GraphQL Code Generator is a CLI tool that can generate code out of your GraphQL schema. When we develop a GraphQL backend, there would be many instances where we would find ourselves writing the same things which are already described by the GraphQL schema, only in a different format; for example: [Typescript typings](https://www.typescriptlang.org/), [Mongoose models](https://mongoosejs.com/), and more.

GraphQL Code Generator was built to address exactly that. By analyzing the schema and parsing it, GraphQL Code Generator can output code at a wide variety of formats, based on pre-defined templates or based on custom user-defined ones. Regardless of the language that you're using, GraphlQL Code Generator got you covered.

For example, given the following schema:

```gql
type Author {
  id: Int!
  firstName: String!
  lastName: String!
  posts(findTitle: String): [Post]
}

type Post {
  id: Int!
  title: String!
  author: Author!
}

type Query {
  posts: [Post]
}

schema {
  query: Query
}
```

GraphQL Code Generator can generate the following Typescript typings:

```ts
interface Query {
  posts?: Post[];
}

interface Post {
  id: number;
  title: string;
  author: Author;
}

interface Author {
  id: number;
  firstName: string;
  lastName: string;
  posts?: Post[];
}

interface PostsAuthorArgs {
  findTitle?: string;
}
```

### Available CLI Options

GraphQL Code Generator is a CLI tool which can be installed using `npm` (or `yarn`):

    $ npm install graphql-code-generator

And is available through `gql-gen`:

    $ gql-gen --help

`gql-gen` is compatible with the following CLI options:

| Flag Name           | Type     | Description                                                                                                                                                                                                                                                                              |
| ------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| -s,--schema         | String   | Local or remote path to GraphQL schema: Introspection JSON file, GraphQL server endpoint to fetch the introspection from, local file that exports `GraphQLSchema`, JSON object or AST string, or a Glob expression for `.graphql` files (`"./src/**/*.graphql"`)                         |
| -cs,--clientSchema  | String   | Local path to GraphQL schema: Introspection JSON file, local file that exports `GraphQLSchema`, JSON object or AST string, or a Glob expression for `.graphql` files (`"./src/**/*.graphql"`)                                                                                            |
| -ms, --merge-schema | String   | Merge schemas with a merge module (`moduleName#mergeFunctionExportedFromThisModule`)                                                                                                                                                                                                     |
| -r,--require        | String   | Path to a `require` extension, [read this](https://gist.github.com/jamestalmage/df922691475cff66c7e6) for more info                                                                                                                                                                      |
| -h,--header         | String   | Header to add to the introspection HTTP request when using remote endpoint                                                                                                                                                                                                               |
| -t,--template       | String   | Template name, for example: "typescript" (not required when using `--project`)                                                                                                                                                                                                           |
| -p,--project        | String   | Project directory with templates (refer to "Custom Templates" section)                                                                                                                                                                                                                   |
| --config            | String   | Path to project config JSON file (refer to "Custom Templates" section), defaults to `gql-gen.json`                                                                                                                                                                                       |
| -o,--out            | String   | Path for output file/directory. When using single-file generator specify filename, and when using multiple-files generator specify a directory                                                                                                                                           |
| -m,--skip-schema    | void     | If specified, server side schema won't be generated through the template (enums won't omit)                                                                                                                                                                                              |
| -c,--skip-documents | void     | If specified, client side documents won't be generated through the template                                                                                                                                                                                                              |
| --no-overwrite      | void     | If specified, the generator will not override existing files                                                                                                                                                                                                                             |
| -w --watch          | boolean  | Enables watch mode for regenerating documents from schema                                                                                                                                                                                                                                |
| --silent            | boolean  | Does not print anything to the console                                                                                                                                                                                                                                                   |
| documents...        | [String] | Space separated paths of `.graphql` files or code files (glob path is supported) that contains GraphQL documents inside strings, or with either `gql` or `graphql` tag (JavaScript), this field is optional - if no documents specified, only server side schema types will be generated |

### Available Templates

As already mentioned, GraphQL Code Generator is not obligated into a single template of code and can operate based on a wide variety of templates. Some are already built-in, as they're likely to be used, and you can also define a custom code generation template by yourself.

The following table includes all the usable templates along with a brief description and a reference to their doc page:

| Language                                | Purpose                                                        | Package Name & Docs                                                                                         |
| --------------------------------------- | -------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| TypeScript                              | Generate server-side TypeScript types, and client-side typings | [`graphql-codegen-typescript-template`](../templates/typescript-typings.md)                                 |
| MongoDB TypeScript Models               | Generate server-side TypeScript types, with MongoDB models     | [`graphql-codegen-typescript-mongodb-template`](../templates/mongodb-typescript-models.md)                  |
| Apollo Angular                          | Generate TypeScript types, and Apollo Angular Services         | [`graphql-codegen-apollo-angular-template`](../templates/apollo-angular.md)                                 |
| React Apollo Typescript                 | Generate TypeScript types, and React Apollo Components         | [`graphql-codegen-typescript-react-apollo-template`](../templates/react-apollo-typescript.md)               |
| TypeScript modules for `.graphql` files | Generates `declare module` for `.graphql` files                | [`graphql-codegen-graphql-files-typescript-modules`](../templates/graphql-typescript-modules.md)            |
| TypeScript Resolvers signature          | Generates TypeScript signature for server-side resolvers       | [`graphql-codegen-typescript-resolvers-template`](../templates/typescript-resolvers.md)                     |

In addition, you can also define custom code template as described in [this doc page](../templates/custom.md).

> ⚠ Swift and Flow code generators were deprecated since version `0.5.5` and should be available to use again soon.

> ⚠ GraphQL's directive feature requires you to add GraphQL version `>0.9.4` as a peer dependency.
