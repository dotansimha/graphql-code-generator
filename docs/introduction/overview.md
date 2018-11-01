---
id: overview
title: Overview
---

GraphQL Code Generator is a CLI tool that can generate TypeScript typings out of a GraphQL schema. When we develop a GraphQL backend, there would be many instances where we would find ourselves writing the same things which are already described by the GraphQL schema, only in a different format; for example: resolver signatures, MongoDB models, Angular services etc.

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

The we can install GraphQL Code Generator using `npm` (or `yarn`):

    $ npm install --save-dev graphql-code-generator

GraphQL Code Generator's behavior is bound into templates, thus we will need to install one:

    $ npm install --save-dev graphql-codegen-typescript-template

Although can be used directly, it's recommended to add the code generation task as an `npm` script in `package.json`. This way we won't have to install GraphQL Code Generator globally:

```json
{
  "scripts": {
    "generate": "gql-gen --url http://localhost:3000/graphql --template ts --out ./src/types.d.ts"
  }
}
```

By running the following command the GraphQL schema will be fetched from the route endpoint and the typescript definitions would be generated in the specified destination:

    $ npm run generate

## Usage

### CLI Usage

Here are some general usage patterns which might come in handy:

- With local introspection JSON file, generate TypeScript types:

```
$ gql-gen --schema mySchema.json --template graphql-codegen-typescript-template --out ./typings/ "./src/**/*.graphql"
```

- With local introspection JSON file, generate TypeScript files, from GraphQL documents inside code files (`.ts`):

```
$ gql-gen --schema mySchema.json --template graphql-codegen-typescript-template --out ./typings/ "./src/**/*.ts"
```

- With remote GraphQL endpoint that requires Authorization, generate TypeScript types:

```
$ gql-gen --schema http://localhost:3010/graphql --header "Authorization: MY_KEY" --template graphql-codegen-typescript-template --out ./typings/ "./src/**/*.graphql"
```

### Runtime Usage

We can `require()` (or `import`) `graphql-code-generator` directly with Node.JS:

```js
const { generate } = require('graphql-code-generator');

async function doSomething() {
  const generatedFiles = await generate({
    schema: 'http://127.0.0.1:3000/graphql',
    template: 'typescript',
    out: process.cwd() + '/models/',
    args: ['./src/**/*.graphql']
  });
}
```

The `generate` function accepts two parameters:

- `options: CLIOptions & { logger: Logger }`
- `saveToFile: boolean`

The return value should be of type `Promise<FileOutput[]>`.

### Webpack Usage

GraphQL codegen can be integrated with Webpack using the `graphql-codegen-webpack` package:

```js
const { GraphQLCodegenPlugin } = require('graphql-codegen-webpack');

module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  entry: './src/index.ts',
  output: {
    filename: 'bundle.js'
  },
  resolve: {
    extensions: ['.ts', '.ts', '.js', '.mjs']
  },
  plugins: [
    // GraphQL Code Generator
    new GraphQLCodegenPlugin({
      schema: 'src/schema.graphql',
      template: 'graphql-codegen-typescript-template',
      out: 'src/types.ts',
      overwrite: true
    })
  ],
  module: {
    rules: [
      { test: /\.ts$/, loader: 'ts-loader' },
      {
        test: /\.mjs$/,
        include: /node_modules/,
        type: 'javascript/auto'
      }
    ]
  }
};
```

### Other Environments

Although GraphQL codegen was built on top of Node.JS it is still fully compatible with other environments by installing it globally and the right command to your build process:

    $ sudo npm install graphql-code-generator

## CLI options

Usage is pretty straight forward.

    $ gql-gen [...options] [...documents]

`documents` represent space separated paths or glob patterns for files which export GraphQL documents using a `gql` tag or a plain string; for example: `./src/**/*.graphql`. If no documents are specified only the server schema types will be generated. Available `options` are listed in the table below:

| Flag Name            | Type     | Description                                                                                                                                                                                                                                                          |
| -------------------- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| -s, --schema         | String   | Local or remote path to GraphQL schema: Introspection JSON file, GraphQL server endpoint to fetch the introspection from, local file that exports `GraphQLSchema`, JSON object or AST string, or Glob expression for `.graphql` files (e.g. `"./src/**/*.graphql"`)  |
| -cs, --clientSchema  | String   | Local path to GraphQL schema: Introspection JSON file, local file that exports `GraphQLSchema`, JSON object or AST string, or Glob expression for `.graphql` files (e.g. `"./src/**/*.graphql"`)                                                                     |
| -ms, --merge-schema  | String   | Merge schemas with a merge module (`moduleName#mergeFunctionExportedFromThisModule`)                                                                                                                                                                                 |
| -r, --require        | String   | Path to a `require` extension. See [reference](https://gist.github.com/jamestalmage/df922691475cff66c7e6) for more info                                                                                                                                              |
| -h, --header         | String   | Header to add to the introspection HTTP request when using remote endpoint                                                                                                                                                                                           |
| -t, --template       | String   | Template name, for example: "typescript" (not required when using `--project`)                                                                                                                                                                                       |
| -p, --project        | String   | Project directory with templates (see [custom template building page](../templates/custom))                                                                                                                                                                          |
| --config             | String   | Path to project config JSON file (see [custom template building page](../templates/custom)). Defaults to `gql-gen.json`                                                                                                                                              |
| -o, --out            | String   | Path to output file/directory. When using single-file generator specify filename, and when using multiple-files generator specify a directory                                                                                                                        |
| -m, --skip-schema    | void     | If specified, server side schema won't be generated through the template (enums won't be omitted)                                                                                                                                                                    |
| -c, --skip-documents | void     | If specified, client side documents won't be generated through the template                                                                                                                                                                                          |
| --no-overwrite       | void     | If specified, the generator will not override existing files                                                                                                                                                                                                         |
| -w --watch           | boolean  | Enables watch mode for regenerating documents from schema. Be sure to have [Watchman](https://facebook.github.io/watchman/) installed before using!                                                                                                                  |
| --silent             | boolean  | Do not print anything to the console                                                                                                                                                                                                                                 |

Alternatively you can run `$ gql-gen --help` at any given point to get a detailed description of the possible options in your terminal.

## Available Templates

As already mentioned, GraphQL Code Generator is not obligated into a single template of code and can operate based on a wide variety of templates. Some are already built-in, as they're likely to be used, and you can also define a custom code generation template by yourself.

The following table includes all the usable templates along with a brief description and a reference to their doc page:

| Language                                | Purpose                                                          | Package Name & Docs                                                                                 |
| --------------------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| TypeScript                              | Generate server-side TypeScript types, and client-side typings   | [`graphql-codegen-typescript-template`](../templates/typescript-typings.md)                         |
| MongoDB TypeScript Models               | Generate server-side TypeScript types, with MongoDB models       | [`graphql-codegen-typescript-mongodb-template`](../templates/mongodb-typescript-models.md)          |
| Apollo Angular                          | Generate TypeScript types, and Apollo Angular Services           | [`graphql-codegen-apollo-angular-template`](../templates/apollo-angular.md)                         |
| React Apollo TypeScript                 | Generate TypeScript types, and React Apollo Components           | [`graphql-codegen-typescript-react-apollo-template`](../templates/react-apollo-typescript.md)       |
| TypeScript modules for `.graphql` files | Generate `declare module` for `.graphql` files                   | [`graphql-codegen-graphql-files-typescript-modules`](../templates/graphql-typescript-modules.md)    |
| TypeScript Resolvers signature          | Generate TypeScript signature for server-side resolvers          | [`graphql-codegen-typescript-resolvers-template`](../templates/typescript-resolvers.md)             |

In addition, you can also define custom code template as described in [this doc page](../templates/custom.md).

> ⚠ Swift and Flow code generators were deprecated since version `0.5.5` and should be available to use again soon.

> ⚠ GraphQL's directive feature requires you to add GraphQL version `>0.9.4` as a peer dependency.
