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

GraphQL Code Generator can generate the following TypeScript typings:

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

## Installation

First we gotta make sure that the basic GraphQL package is within our dependencies, since GraphQL Code Generator is dependent on it:

    $ yarn add graphql

The we can install GraphQL Code Generator using `yarn` (or `npm`):

    $ yarn add -D @graphql-codegen/cli

## Initialization Wizard

GraphQL Code Generator lets you setup everything by simply running the following command:

    $ graphql-codegen init

Question by question, it will guide you through the whole process of setting up a schema, selecting and intalling plugins, picking a destination of a generated file and a lot more.

If you don't want to use the wizard, we've got you covered, just continue reading the next sections.

## Setup

GraphQL Code Generator's behavior is bound into plugins, thus we will need to install one of them:

    $ yarn add -D @graphql-codegen/typescript

Although can be used directly, it's recommended to add the code generation task as an `npm` script in `package.json`. This way we won't have to install GraphQL Code Generator globally:

```json
{
  "scripts": {
    "generate": "graphql-codegen"
  }
}
```

GraphQL Code Generator looks for `codegen.yml` and `codegen.json` files by default, one might look like this:

```yaml
schema: http://localhost:3000/graphql
generates:
  ./src/types.d.ts:
    plugins:
      - typescript
```

By running the following command the GraphQL schema will be fetched from the route endpoint and the typescript definitions would be generated in the specified destination:

    $ npm run generate

## Usage

There are different methods to use GraphQL Code Generator besides the [CLI](../cli/index). Here are other possible methods to do so which you might find useful:

### Using in Runtime

We can `require()` (or `import`) `@graphql-codegen/cli` directly with Node.JS:

```js
import { generate } from '@graphql-codegen/cli';

async function doSomething() {
  const generatedFiles = await generate(
    {
      schema: 'http://127.0.0.1:3000/graphql',
      documents: './src/**/*.graphql',
      generates: {
        [process.cwd() + '/models/']: {
          plugins: ['typescript'],
        },
      },
    },
    true
  );
}
```

The `generate` function accepts two parameters:

- `options`
- `saveToFile: boolean`

The return value should be of type `Promise<FileOutput[]>`.
