# GraphQL Code Generator

TEST TEST TEST

15

[![npm version](https://badge.fury.io/js/%40graphql-codegen%2Fcli.svg)](https://badge.fury.io/js/%40graphql-codegen%2Fcli)
[![CircleCI](https://circleci.com/gh/dotansimha/graphql-code-generator/tree/master.svg?style=svg)](https://circleci.com/gh/dotansimha/graphql-code-generator/tree/master)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![renovate-app badge][renovate-badge]][renovate-app]

[renovate-badge]: https://img.shields.io/badge/renovate-app-blue.svg
[renovate-app]: https://renovateapp.com/

[graphql-code-generator.com](https://graphql-code-generator.com)

<p align="center">
    <img src="https://github.com/dotansimha/graphql-code-generator/blob/master/logo.png?raw=true" />
</p>

[GraphQL Codegen 1.0 is here!](https://graphql-code-generator.com/docs/migration/from-0-18)

GraphQL Code Generator is a tool that generates code out of your GraphQL schema. Whether you are developing a frontend or backend, you can utilize GraphQL Code Generator to generate output from your GraphQL Schema and GraphQL Documents (query/mutation/subscription/fragment).

By analyzing the schema and documents and parsing it, GraphQL Code Generator can output code at a wide variety of formats, based on pre-defined templates or based on custom user-defined ones. Regardless of the language that you're using, GraphQL Code Generator got you covered.

GraphQL Code Generator let you choose the output that you need, based on _plugins_, which are very flexible and customizable. You can also write your own _plugins_ to generate custom outputs that matches your needs.

You can try this tool live on your browser and see some useful examples. Check out [GraphQL Code Generator Live Examples](https://graphql-code-generator.com/#live-demo).

We currently support and maintain [these plugins](https://graphql-code-generator.com/docs/plugins/) (TypeScript, Flow, React, Angular, MongoDB, Stencil, Reason and some more), and there is an active community that writes and maintains custom plugins.

### Quick Start

Install using `yarn`:

    $ yarn add -D graphql @graphql-codegen/cli

GraphQL Code Generator lets you setup everything by simply running the following command:

    $ graphql-codegen init

Question by question, it will guide you through the whole process of setting up a schema, selecting plugins, picking a destination of a generated file and a lot more.

If you don't want to use the wizard, create a basic `codegen.yml` configuration file, point to your schema, and pick the plugins you wish to use. For example:

```yml
schema: http://localhost:3000/graphql
generates:
  src/types.ts:
    - typescript
```

Then, run the code-generator using `graphql-codegen` command:

    $ graphql-codegen

The command above may fetch (for example) the following GraphQL schema:

```graphql
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

And generate the following TypeScript typings:

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

Besides our [docs page](https://graphql-code-generator.com/docs/getting-started/index), feel free to go through our published Medium articles to get a better grasp of what GraphQL Code Generator is all about:

- [All available plugins](https://graphql-code-generator.com/docs/plugins/)

- [**GraphQL Code-Generator** - The True GraphQL-First platform](https://medium.com/@dotansimha/graphql-code-generator-a34e3785e6fb)

- [**GraphQL Code-Generator v0.9** - What's new?](https://medium.com/@dotansimha/whats-new-in-graphql-code-generator-0-9-0-dba6c9e365d)

- [**GraphQL Code Generator v0.11** - Generate React and Angular Apollo Components, Resolver signatures and much more!](https://medium.com/the-guild/graphql-code-generator-v0-11-15bb9b02899e)

### Contributing

Feel free to open issues and pull requests. We're always welcome support from the community.

To run this project locally:

- Use Node >= 8
- Make sure that you have the latest Yarn version (https://yarnpkg.com/lang/en/docs/install/)
- Clone this repo using `git clone`
- Run `yarn` on the root dir (it has a Yarn workspace defined, so all the packages dependencies will be installed)
- Run `yarn build` to build all core packages and plugins
- Run `yarn test` to make sure everything works

### License

[![GitHub license](https://img.shields.io/badge/license-MIT-lightgrey.svg?maxAge=2592000)](https://raw.githubusercontent.com/apollostack/apollo-ios/master/LICENSE)

MIT
