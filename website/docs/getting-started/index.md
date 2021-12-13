---
id: index
title: Introduction to GraphQL Code Generator
---

GraphQL Code Generator is a tool for generating code out of a GraphQL schema and GraphQL operations (`query` / `mutation` / `subscription`).

You can use GraphQL Code Generator in many development environments - it can integrate with your project, or just act as a utility tool.

When developers use GraphQL, they often need a way to integrate the GraphQL language (called GraphQL SDL) with their development platform (for example: if you are working in a TypeScript project, you can generate typings based on your GraphQL schema or operations, to leverage type-safety).

GraphQL Code Generator was built to address exactly that. By analyzing and parsing the GraphQL schema and operations, GraphQL Code Generator can output code at a wide variety of formats, based on pre-defined plugins or based on custom user-defined ones.

Regardless of the language/environment that you're using, GraphQL Code Generator got you covered.

### Integration example with TypeScript

![Codegen flow exmaple](/assets/illustrations/codegen_flow1.png)

For example, given the following GraphQL schema:

```graphql
# schema.graphql

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
```

And with the following `codegen.yml` configuration file:

```yml
# codegen.yml
schema: schema.graphql
generates:
  types.ts:
    plugins:
      - @graphql-codegen/typescript
```

So now, GraphQL Code Generator, with the `@graphql-codegen/typescript` plugin can generate the following TypeScript typings file:

```ts
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;

// ...

/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type Author = {
  __typename?: 'Author';
  id: Scalars['Int'];
  firstName: Scalars['String'];
  lastName: Scalars['String'];
  posts?: Maybe<Array<Maybe<Post>>>;
};

export type AuthorPostsArgs = {
  findTitle?: InputMaybe<Scalars['String']>;
};

export type Post = {
  __typename?: 'Post';
  id: Scalars['Int'];
  title: Scalars['String'];
  author: Author;
};

export type Query = {
  __typename?: 'Query';
  posts?: Maybe<Array<Maybe<Post>>>;
};
```

## What's next?

Start by [installing GraphQL Code Generator](/docs/getting-started/installation) in your project, and use the basic plugins to generate some code.

You can go over [the list of available plugins](/plugins) and find more plugins that matches your needs.

If you are having issues, you can reach us this the following:

- Found a bug? [report it in our GitHub repo](https://github.com/dotansimha/graphql-code-generator)
- Need help or have a question? You can use the live chat box in the corner of the screen, [ask it in our GitHub Discussions page](https://github.com/dotansimha/graphql-code-generator/discussions) or [reach us directly in our Discord](http://bit.ly/guild-chat).
- We have more awesome [open source tools](https://github.com/the-guild-org/Stack)!
- You can [visit our website](http://the-guild.dev) for more information about us and what we do
