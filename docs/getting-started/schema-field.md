---
id: schema-field
title: `schema` field
---

The `schema` field should point to your `GraphQLSchema` - there are multiple ways you can specify it and load your `GraphQLSchema`.

You can specify either a `string` pointing to your schema, or `string[]` point to multiple schemas, and they will be merged.

## How to use it?

### Root level

You can specify the `schema` field in your root level config, as follow:

```yml
schema: http://localhost:3000/graphql
generates:
  ./src/types.ts:
    plugins:
      - typescript
```

### Output-file level

Or, you can specify it per-output file level. This way you can

```yml
generates:
  ./src/types1.ts:
    schema: http://server1.com/graphql
    plugins:
      - typescript
  ./src/types2.ts:
    schema: http://server2.com/graphql
    plugins:
      - typescript
```

### Multiple schemas and client-side schema

You can also specify `schema` on both levels: root and output-file, and then GraphQL Code Generator will merge both schemas into one:

```yml
schema: http://localhost:3000/graphql
generates:
  ./src/types.ts:
    schema: ./schema.graphql
    plugins:
      - typescript
      - typescript-operations
```

> It's also useful if you have a remote schema coming from a server, and a client-side schema that available in your client-side.

## Available formats

The following can be specified as a single value, or as an array with mixed values.

- ### URL

You can specify a URL to load your `GraphQLSchema` from:

```yml
schema: http://localhost:3000/graphql
```

You can also specify custom HTTP headers to be sent with the request:

```yml
schema:
  - http://localhost:3000/graphql:
      headers:
        Authorization: YOUR-TOKEN-HERE
```

- ### JSON

You can point to a local `.json` file that contains [GraphQL Introspection](https://graphql.org/learn/introspection/) JSON.

```yml
schema: schema.json
```

- ### `.graphql` file

You can point to a single `.graphql` file that contains AST string of your schema:

```yml
schema: schema.graphql
```

> It also supports [`graphql-import`](https://github.com/prisma/graphql-import) syntax, so you can point to a single `schema.graphql` file that imports other files.

- ### Glob Expression

You can also point to multiple `.graphql` files, and the Code Generator will merge and build your GraphQL schema from those files.

```yml
schema: src/**/*.graphql
```

You can also specify multiplep patterns:

```yml
schema:
  - src/dir1/**/*.graphql
  - src/dir2/**/*.graphql
```

And, you can specify files to exclude: 

```yml
schema:
  - './src/**/*.graphql'
  - '!*.generated.graphql'
```

> All provided glob expressions are being evaludated together - the usage is similar to `.gitingore` file.

Additionally, you can use code files and the codegen will try to extract the GraphQL schema from it:

```yml
schema: './src/**/*.ts'
```

The codegen will try to load the file as AST and look for explicit GraphQL strings, but if it can't find those, it will try to `require` the file and looks for operations in the default export.

You can disable the `require` if it causes errors for you (for example, because of different module system or missing deps):

```yml
schema:
  './src/**/*.ts':
    noRequire: true
```

- ### JavaScript export

You can also specify a code file that exports your `GraphQLSchema` object as named export `schema` or as default export.

```yml
schema: schema.js
```

```javascript
const { buildSchema } = require('graphql');

module.exports = buildSchema(/* GraphQL */ `
  type MyType {
    foo: String!
  }

  type Query {
    myType: MyType!
  }
`);
```

> You can also import from TypeScript files, but don't forget to specify [require field](./require-field).

- ### String

You can specify your schema directly as AST string in your config file. It's very useful for testing.

```yml
schema: 'type MyType { foo: String }    type Query { myType: MyType }'
```

## Custom Schema Loader

If you schema has a different, or complicated way of loading, you can specify a custom loader (with the `loader` field) for your schema, by pointing to a code file that exports a `function` as default, in each schema that your are loading.

```yml
schema:
  - http://localhost:3000/graphql:
      loader: my-url-loader.js
  - schema.graphql:
      loader: my-file-loader.js
```

Your custom loader should export a default function, and return `GraphQLSchema` object. For example:

```js
const { buildSchema } = require('graphql');
const { readFileSync } = require('fs');

module.exports = function(schemaString, config) {
  return buildSchema(readFileSync(schemaString, { encoding: 'utf-8' }));
};
```
