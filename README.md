# GraphQL Code Generator

[![npm version](https://badge.fury.io/js/graphql-code-generator.svg)](https://badge.fury.io/js/graphql-code-generator)
[![CircleCI](https://circleci.com/gh/dotansimha/graphql-code-generator/tree/master.svg?style=svg)](https://circleci.com/gh/dotansimha/graphql-code-generator/tree/master)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![renovate-app badge][renovate-badge]][renovate-app]

[renovate-badge]: https://img.shields.io/badge/renovate-app-blue.svg
[renovate-app]: https://renovateapp.com/

GraphQL Code Generator is a CLI tool that can generate code out of your GraphQL schema. When we develop a GraphQL backend, there would be many instances where we would find ourselves writing the same things which are already described by the GraphQL schema, only in a different format; for example: [Typescript typings](https://www.typescriptlang.org/), [Mongoose models](https://mongoosejs.com/), and more.

GraphQL Code Generator was built to address exactly that. By analyzing the schema and parsing it, GraphQL Code Generator can output code at a wide variety of formats, based on pre-defined templates or based on custom user-defined ones. Regardless of the language that you're using, GraphlQL Code Generator got you covered.

<p align="center">
    <img src="https://github.com/dotansimha/graphql-code-generator/blob/master/logo.png?raw=true" />
</p>

### Quick Start

Install using `npm` (or `yarn`):

    $ npm install graphql-code-generator

Generate code using `gql-gen`:

    $ gql-gen --url http://localhost:3000/graphql --template ts --out ./src/types.d.ts

The command above may fetch (for example) the following schema:

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

And generate the following Typescript typings:

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

### Links

To get a grasp of what GraphQL Code Generator is all about, it's recommended to go through the **docs:**

#### [Introduction](./docs/introduction)

- [Overview](./docs/introduction/overview.md)

- [Getting Started](./docs/introduction/getting-started.md)

- [Example Use Cases](./docs/introduction/examples.md)

#### [Built-In Templates](./docs/templates)

- [Apollo/Angular Template](./docs/templates/apollo-angular.md)

- [GraphQL Typescript Modules Template](./docs/templates/graphql-typescript-modules.md)

- [Mongodb Typescript Models Template](./docs/templates/mongodb-typescript-models.md)

- [React/Apollo/Typescript Template](./docs/templates/react-apollo-typescript.md)

- [Typescript Resolvers Template](./docs/templates/typescript-resolvers.md)

- [Typescript Typings Template](./docs/templates/typescript-typings.md)

- [Using a Custom Template](./docs/templates/custom.md)

Alternatively, you may go through the following **Medium articles:**

- [**GraphQL Code-Generator** - The True GraphQL-First platform](https://medium.com/@dotansimha/graphql-code-generator-a34e3785e6fb)

- [**GraphQL Code-Generator v0.9** - What's new?](https://medium.com/@dotansimha/whats-new-in-graphql-code-generator-0-9-0-dba6c9e365d)

- [**GraphQL Code Generator v0.11** - Generate React and Angular Apollo Components, Resolver signatures and much more!](https://medium.com/the-guild/graphql-code-generator-v0-11-15bb9b02899e)

### License

MIT
