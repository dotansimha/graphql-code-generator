---
id: index
title: What is GraphQL Code Generator?
---

GraphQL Code Generator is a CLI tool that can generate TypeScript typings out of a GraphQL schema. When we develop a GraphQL backend, there would be many instances where we would find ourselves writing the same things which are already described by the GraphQL schema, only in a different format; for example: resolver signatures, MongoDB models, Angular services etc.

GraphQL Code Generator was built to address exactly that. By analyzing the schema and parsing it, GraphQL Code Generator can output code at a wide variety of formats, based on pre-defined plugins or based on custom user-defined ones. Regardless of the language that you're using, GraphQL Code Generator got you covered.

For example, given the following schema:

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

GraphQL Code Generator can generate the following TypeScript typings (this example is using `typescript` plugin):

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

## What's next?

Start by [installing GraphQL Code Generator](installation.md) in your project, and use the basic plugins to generate some code. 

You can go over [the list of available plugins](../plugins/index.md) and find more plugins that matches your needs. 

If you are having issues, you can reach us this the following:

- Found a bug? [report it in our GitHub repo](https://github.com/dotansimha/graphql-code-generator)
- Need help or have a question? You can use the live chat box in the corner of the screen, [ask it in our GitHub Discussions page](https://github.com/dotansimha/graphql-code-generator/discussions) or [reach us directly in our Discord](http://bit.ly/guild-chat).
- We have more awesome [open source tools](https://github.com/the-guild-org/Stack)!
- You can [visit our website](http://the-guild.dev/) for more information about us and what we do  
