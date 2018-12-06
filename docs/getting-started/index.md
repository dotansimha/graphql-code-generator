---
id: index
title: What is GraphQL Code Generator?
---

GraphQL Code Generator is a CLI tool that can generate TypeScript typings out of a GraphQL schema. When we develop a GraphQL backend, there would be many instances where we would find ourselves writing the same things which are already described by the GraphQL schema, only in a different format; for example: resolver signatures, MongoDB models, Angular services etc.

GraphQL Code Generator was built to address exactly that. By analyzing the schema and parsing it, GraphQL Code Generator can output code at a wide variety of formats, based on pre-defined plugins or based on custom user-defined ones. Regardless of the language that you're using, GraphlQL Code Generator got you covered.

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

GraphQL Code Generator can generate the following TypeScript typings:

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

GraphQL codegen uses [prettier](https://github.com/prettier/prettier) inside the box, which means that the output code should always be formatted in a pretty way whenever possible. Accordingly, if your project includes a [prettier config file](https://prettier.io/docs/en/configuration.html) it should be respected and the code should be generated accordingly.

## Installation

First we gotta make sure that the basic GraphQL package is within our dependencies, since GraphQL Code Generator is dependent on it:

    $ npm install graphql

The we can install GraphQL Code Generator using `yarn` (or `npm`):

    $ npm install -D graphql-code-generator

GraphQL Code Generator's behavior is bound into plugins, thus we will need to install few:

    $ npm install -D graphql-codegen-typescript-common graphql-codegen-typescript-server

Although can be used directly, it's recommended to add the code generation task as an `npm` script in `package.json`. This way we won't have to install GraphQL Code Generator globally:

```json
{
  "scripts": {
    "generate": "gql-gen"
  }
}
```

GraphQL Code Generator looks for `codegen.yml` and `codegen.json` files by default, one might look like this:

```yaml
schema: http://localhost:3000/graphql
overwrite: true
generates:
  ./src/types.d.ts:
    plugins:
      - typescript-common
      - typescript-server
```

By running the following command the GraphQL schema will be fetched from the route endpoint and the typescript definitions would be generated in the specified destination:

    $ npm run generate

## Usage

There are different methods to use GraphQL Code Generator besides the [CLI](../cli/index). Here are other possible methods to do so which you might find useful:

### Using in Runtime

We can `require()` (or `import`) `graphql-code-generator` directly with Node.JS:

```js
import { generate } from 'graphql-code-generator';

async function doSomething() {
  const generatedFiles = await generate(
    {
      schema: 'http://127.0.0.1:3000/graphql',
      overwrite: true,
      documents: './src/**/*.graphql',
      generates: {
        [process.cwd() + '/models/']: {
          plugins: ['typescript-common', 'typescript-server']
        }
      }
    },
    true
  );
}
```

The `generate` function accepts two parameters:

- `options`
- `saveToFile: boolean`

The return value should be of type `Promise<FileOutput[]>`.

### Using With Other Environments

Although GraphQL codegen was built on top of Node.JS it is still fully compatible with other environments by installing it globally and the right command to your build process:

    $ sudo npm install -g graphql-code-generator
