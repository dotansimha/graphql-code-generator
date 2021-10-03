---
id: documents-field
title: "`documents` field"
---

The `documents` field should point to your GraphQL documents: `query`, `mutation`, `subscription` and `fragment`.

It's optional, and required only if you are using plugins that generates code for the client-side.

You can specify either a `string` pointing to your documents, or `string[]` point to multiple documents.

## How to use it?

### Root level

You can specify the `documents` field in your root level config:

```yml
schema: http://localhost:3000/graphql
documents: 'src/**/*.graphql'
generates:
  ./src/types.ts:
    plugins:
      - typescript
      - typescript-operations
```

### Output-file level

You can also specify the `documents` field in your generated file config:

```yml
schema: http://server1.com/graphql
generates:
  ./src/types1.ts:
    documents: 'src/**/*.graphql'
    plugins:
      - typescript
      - typescript-operations
```

### Document Scanner

The code-generator has a built-in document scanner, which means that you can specify a `.graphql` file or code files that contains GraphQL documents.

You can tell it to find documents in TypeScript files:

```yml
schema: http://server1.com/graphql
documents: "src/**/!(*.d).{ts,tsx}"
```

## Available Formats

The following can be specified as a single value or as an array with mixed values.

- ### Local File

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

You can specify a Glob expression in order to load multiple files:

```yml
documents: './src/**/*.graphql'
```

You can also specify multiple Glob expressions as an array:

```yml
documents:
  - './src/dir1/*.graphql'
  - './src/dir2/*.graphql'
```

You can specify files to exclude by prefixing the Glob expression with `!`:

```yml
documents:
  - './src/**/*.graphql'
  - '!*.generated.graphql'
```

> All provided glob expressions are evaluated together. The usage is similar to `.gitignore`.

Additionally, you can use code files and the codegen will try to extract the GraphQL documents from it:

```yml
documents:
  - './src/*.jsx'
```

The codegen will try to load the file as an AST and look for explicit GraphQL operations strings, but if it can't find those, it will try to `require` the file and look for operations in the default export.

You can disable the `require` if it causes errors for you (for example, because of different module system):

```yml
documents:
  - './src/*.jsx':
    noRequire: true
```

> Your operations should be declared as template strings with the `gql` tag or with a GraphQL comment (`` const myQuery = /* GraphQL*/`query { ... }` ``). This can be configured with `pluckConfig` (see below).

- ### String

You can specify your GraphQL documents directly as an AST string in your config file. It's very useful for testing.

```yml
documents:
  - 'query { f1 }'
  - 'query { f2 }'
```

## GraphQL Tag Pluck

GraphQL Code Generator uses `graphql-tag-pluck` internally to extract GraphQL documents from your code file.

If you are pointing to a code file (such as `.js` or `.jsx`), GraphQL will try to look for usages of `gql` tag, or string literals that are using magic GraphQL comment (`/* GraphQL */`), for example:


```jsx
import React from 'react';
import { gql } from 'graphql-tag';

// This will work
const MY_QUERY = gql`
  query myQuery {
    getSomething {
      id
    }
  }
`;

// This will also work
const MY_QUERY = /* GraphQL */`
  query myQuery {
    getSomething {
      id
    }
  }
`;

// ... some components code ...
```

By default, it has a predefined list of popular `gql` tags to look for, in order to make sure it's not trying to extract an invalid or unrelated string. [The default list could be found here](https://github.com/ardatan/graphql-tools/blob/master/packages/graphql-tag-pluck/src/visitor.ts#L12)

You can add custom tags if you need, by using `pluckConfig` on the root level on your config file:

```yaml
pluckConfig:
  modules:
    - name: my-custom-module
      identifier: gql
```

You can also customize globally used identifiers, like that:

```yaml
pluckConfig:
  globalGqlIdentifierName:
    - gql
    - graphql
    - myCustomGlobalGqlTag
```

And you can customize the magic GraphQL commend by doing:

```yaml
pluckConfig:
  gqlMagicComment: customcomment
```

## Custom Document Loader

If your schema has a different or complicated way of loading, you can specify a custom loader with the `loader` field.

```yml
documents:
    - "**/*.graphql":
        loader: my-documents-loader.js
```

Your custom loader should export a default function that returns a `DocumentNode`. For example:

```js
const { parse } = require('graphql');
const { readFileSync } = require('fs');

module.exports = function(docString, config) {
  return parse(readFileSync(docString, { encoding: 'utf-8' }));
};
```

> The second parameter passed to the loader function is a config object that includes a `pluginContext` property. This value is passed to any executed plugins, so it can be modified by the loader to pass any additional information to those plugins.
