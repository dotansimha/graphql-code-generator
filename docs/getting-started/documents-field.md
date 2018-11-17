---
id: documents-field
title: `documents` field
---

The `documents` field should point to your GraphQL documents: `query`, `mutation`, `subscription` and `fragment`.

It's optional, and required only if you are using plugins that generates code for the client-side.

You can specify either a `string` pointing to your documents, or `string[]` point to multiple documents.

## How to use it?

### Root level

You can specify the `documents` field in your root level config, as follow:

```yml
schema: http://localhost:3000/graphql
documents: src/**/*.graphql
generates:
  ./src/types.ts:
    plugins:
      - typescript-common
      - typescript-client
```

### Output-file level

Or, you can specify it per-output file level. This way you can

```yml
schema: http://server1.com/graphql
generates:
  ./src/types1.ts:
    documents: src/**/*.graphql
    plugins:
      - typescript-common
      - typescript-client
```

### Document Scanner

The code-generator has a built-in document scanner, which means that you can specify a `.graphql` file, or code files, that contains GraphQL documents.

You can use this this way:

```yml
schema: http://server1.com/graphql
documents: src/**/*.{ts,tsx}
```

And the code-generator will look for GraphQL documents inside your code files.

## Available formats

The following can be specified as a single value, or as an array with mixed values.

- ### Filename

You can specify a `string` to point to a single file:

```yml
documents: my-query.graphql
```

Or `string[]` to point to multiple files:

```yml
documents:
  - my-query.graphql
  - my-other-query.graphql
```

- ### Glob Expression

You can specify a Glob expresion in order to load multiple files:

```yml
documents: './src/**/*.graphql'
```

You can also specify multiple Glob expressions, as array:

```yml
documents:
  - './src/dir1/*.graphql'
  - './src/dir2/*.graphql'
```

- ### String

You can specify your GraphQL documents directly as AST string in your config file. It's very useful for testing.

```yml
documents:
  - 'query { f1 }'
  - 'query { f2 }'
```

## Custom Document Loader

If you documents has a different, or complicated way of loading, you can specify a custom loader (with the `loader` field) for your documents, by pointing to a code file that exports a `function` as default, in each documents that your are loading.

```yml
documents:
    - "**/*.graphql"
        loader: my-documents-loader.js
```

Your custom loader should export a default function, and return an array of `{ filePath: string, content: DocumentNode }`. For example:

```js
const { parse } = require('graphql');
const { readFileSync } = require('fs');

module.exports = function(docString, config) {
  return [
    {
      filePath: docString,
      content: parse(readFileSync(docString, { encoding: 'utf-8' }))
    }
  ];
};
```
