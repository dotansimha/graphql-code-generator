---
id: schema-field
title: "`schema` field"
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

### URL

You can specify a URL to load your `GraphQLSchema` from:

```yml
schema: http://localhost:3000/graphql
```

#### Supported Configuration

##### `headers`

You can also specify custom HTTP headers to be sent with the request:

```yml
schema:
  - http://localhost:3000/graphql:
      headers:
        Authorization: YOUR-TOKEN-HERE
```

> Note that spacing and indentation is very important in YAML, so please make sure it matches the examples above.

##### `customFetch`

You can specify a custom fetch function for the HTTP request, using the module name you wish to use:

```yml
schema:
  - http://localhost:3000/graphql:
      customFetch: 'my-custom-fetch'
```

##### `method`

You can specify a HTTP method to use for the introspection query. default is `POST`.

```yml
schema:
  - http://localhost:3000/graphql:
      method: GET
```

### JSON

You can point to a local `.json` file that contains [GraphQL Introspection](https://graphql.org/learn/introspection/) JSON.

```yml
schema: schema.json
```

### Local `.graphql` files

You can point to a single `.graphql` file that contains AST string of your schema:

```yml
schema: schema.graphql
```

Or, you can point to multiple files using a glob expression (codegen will merge the schema files for you):

```yml
schema: 'src/**/*.graphql'
```

You can also specify multiple patterns:

```yml
schema:
  - 'src/dir1/**/*.graphql'
  - 'src/dir2/**/*.graphql'
```

And, you can specify files to exclude/ignore, using the `!` sign: 

```yml
schema:
  - './src/**/*.graphql'
  - '!*.generated.graphql'
```

> All provided glob expressions are evaluated together. The usage is similar to `.gitignore`.

#### Supported Configuration

##### `skipGraphQLImport`

By default, codegen skips `graphql-import` in favor of loading all files using glob expressions.

If you are using `graphql-import` syntax in your schema definitions, you can tell codegen to use those import statements:

```yml
schema:
  - 'src/dir1/**/*.graphql':
      skipGraphQLImport: false
```

##### `commentDescriptions`

This will convert all deprecated form of Graphql comments (marked with `#`) into a GraphQL descriptions (marked with `"`) during the parsing phase.

```yml
schema:
  - 'src/dir1/**/*.graphql':
      commentDescriptions: true
```

##### `assumeValidSDL`

Set to true to assume the SDL is valid, and skip any SDL syntax validations.

```yml
schema:
  - 'src/dir1/**/*.graphql':
      assumeValidSDL: true
```

### Code Files

You can use code files and the codegen will try to extract the GraphQL schema from it, based on `gql` tag:

```yml
schema: './src/**/*.ts'
```

The codegen will try to load the file as an AST and look for explicit GraphQL strings, but if it can't find those, it will try to `require` the file and looks for operations in the default export.

#### Supported Configuration

##### `noRequire`

You can disable the `require` if it causes errors for you (for example, because of different module system or missing deps):

```yml
schema:
  - './src/**/*.ts':
      noRequire: true
```

##### `noPluck`

You can disable the AST lookup phase, and tell codegen to skip and directly try to `require` each file:

```yml
schema:
  - './src/**/*.ts':
      noPluck: true
```
##### `assumeValid`

Set this to `true` in order to tell codegen to skip AST validation.

```yml
schema:
  - './src/**/*.ts':
      assumeValid: true
```

### JavaScript export

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

> You can also import from TypeScript files, but don't forget to specify [require field](require-field.md).

### String

You can specify your schema directly as an AST string in your config file. It's very useful for testing.

```yml
schema: 'type MyType { foo: String }    type Query { myType: MyType }'
```

### GitHub

You can load your schema file from a remote GitHub file, using the following syntax:

```yml
schema: github:user/repo#branchName:path/to/file.graphql
```

> You can load from a JSON file, `.graphql` file or from a code file containing `gql` tag syntax.

### Git

You can load your schema file from a Git repository, using the following syntax:

```yml
schema: git:branch:path/to/file.graphql
```

> You can load from a JSON file, `.graphql` file or from a code file containing `gql` tag syntax.


### Apollo Engine

You can load your schema from Apollo Engine, with the following syntax:

```yml
schema:
  - apollo-engine: 
      engine:
        apiKey: APOLLO_ENGINE_KEY_ID
      graph: GRAPH_ID
      variant: current
```

## Custom Schema Loader

If your schema has a different or complicated way of loading, you can point to a single code file, that does that work for you.

```yml
schema:
  - http://localhost:3000/graphql:
      loader: ./my-url-loader.js
  - schema.graphql:
      loader: ./my-file-loader.js
```

Your custom loader should export a default function that returns `GraphQLSchema` object, or an identifier called `schema`. For example:

```js
const { buildSchema } = require('graphql');
const { readFileSync } = require('fs');

module.exports = function(schemaString, config) {
  // Your logic for loading your GraphQLSchema
  return buildSchema(readFileSync(schemaString, { encoding: 'utf-8' }));
};
```

> The second parameter passed to the loader function is a config object that includes a `pluginContext` property. This value is passed to any executed plugins, so it can be modified by the loader to pass any additional information to those plugins.
