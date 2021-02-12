[![CodeGen](https://user-images.githubusercontent.com/25294569/63773131-35f6aa00-c8e3-11e9-8191-fc0ac6f959e4.gif)](https://graphql-code-generator.com)

[![npm version](https://badge.fury.io/js/%40graphql-codegen%2Fcli.svg)](https://badge.fury.io/js/%40graphql-codegen%2Fcli)
[![CircleCI](https://circleci.com/gh/dotansimha/graphql-code-generator/tree/master.svg?style=svg)](https://circleci.com/gh/dotansimha/graphql-code-generator/tree/master)
[![Discord Chat](https://img.shields.io/discord/625400653321076807)](https://discord.gg/xud7bH9)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![renovate-app badge][renovate-badge]][renovate-app]

[renovate-badge]: https://img.shields.io/badge/renovate-app-blue.svg
[renovate-app]: https://renovateapp.com/

[graphql-code-generator.com](https://graphql-code-generator.com)

[GraphQL Codegen 1.0 is here!](https://graphql-code-generator.com/docs/migration/from-0-18)

GraphQL Code Generator is a tool that generates code out of your GraphQL schema. Whether you are developing a frontend or backend, you can utilize GraphQL Code Generator to generate output from your GraphQL Schema and GraphQL Documents (query/mutation/subscription/fragment).

By analyzing the schema and documents and parsing it, GraphQL Code Generator can output code at a wide variety of formats, based on pre-defined templates or based on custom user-defined ones. Regardless of the language that you're using, GraphQL Code Generator got you covered.

GraphQL Code Generator lets you choose the output that you need, based on _plugins_, which are very flexible and customizable. You can also write your _plugins_ to generate custom outputs that match your needs.

You can try this tool live on your browser and see some useful examples. Check out [GraphQL Code Generator Live Examples](https://graphql-code-generator.com/#live-demo).

We currently support and maintain [these plugins](https://graphql-code-generator.com/docs/plugins/index) (TypeScript, Flow, React, Angular, MongoDB, Stencil, Reason, and some more), and there is an active community that writes and maintains custom plugins.

### Quick Start

Start by installing the basic deps of GraphQL Codegen;

    yarn add graphql
    yarn add -D @graphql-codegen/cli

GraphQL Code Generator lets you setup everything by simply running the following command:

    yarn graphql-codegen init

Question by question, it will guide you through the whole process of setting up a schema, selecting plugins, picking a destination of a generated file, and a lot more.

If you don't want to use the wizard, install it by yourself and create a basic `codegen.yml` configuration file, point to your schema, and pick the plugins you wish to use. 

Install CLI using `yarn`:

    yarn add -D @graphql-codegen/cli

And create a config like below:

```yml
schema: http://localhost:3000/graphql
generates:
  ./src/types.d.ts:
    plugins:
      - typescript
```

Then, run the code-generator using `graphql-codegen` command:

    yarn graphql-codegen

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
export type Maybe<T> = T | null;

/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string,
  String: string,
  Boolean: boolean,
  Int: number,
  Float: number,
};

export type Author = {
  __typename?: 'Author',
  id: Scalars['Int'],
  firstName: Scalars['String'],
  lastName: Scalars['String'],
  posts?: Maybe<Array<Maybe<Post>>>,
};

export type AuthorPostsArgs = {
  findTitle?: Maybe<Scalars['String']>
};

export type Post = {
  __typename?: 'Post',
  id: Scalars['Int'],
  title: Scalars['String'],
  author: Author,
};

export type Query = {
  __typename?: 'Query',
  posts?: Maybe<Array<Maybe<Post>>>,
};
```

### Links

Besides our [docs page](https://graphql-code-generator.com/docs/getting-started/index), feel free to go through our published Medium articles to get a better grasp of what GraphQL Code Generator is all about:

- [All available plugins](https://graphql-code-generator.com/docs/plugins/index)

- [**GraphQL Code-Generator** - The True GraphQL-First platform](https://the-guild.dev/blog/graphql-code-generator)

- [**GraphQL Code-Generator v0.9** - What's new?](https://the-guild.dev/blog/graphql-code-generator-090)

- [**GraphQL Code Generator v0.11** - Generate React and Angular Apollo Components, Resolver signatures and much more!](https://the-guild.dev/blog/graphql-code-generator-011)

### Contributing

If this is your first time contributing to this project, please do read our [Contributor Workflow Guide](https://github.com/the-guild-org/Stack/blob/master/CONTRIBUTING.md) before you get started off.

Feel free to open issues and pull requests. We're always welcome support from the community.

For a contribution guide specific to this project, please refer to: http://graphql-code-generator.com/docs/custom-codegen/contributing

### Code of Conduct

Help us keep GraphQL Codegenerator open and inclusive. Please read and follow our [Code of Conduct](https://github.com/the-guild-org/Stack/blob/master/CODE_OF_CONDUCT.md) as adopted from [Contributor Covenant](https://www.contributor-covenant.org/)


### License

[![GitHub license](https://img.shields.io/badge/license-MIT-lightgrey.svg?maxAge=2592000)](https://raw.githubusercontent.com/apollostack/apollo-ios/master/LICENSE)

MIT
