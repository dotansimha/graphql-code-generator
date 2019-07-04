---
id: programmatic-usage
title: Programmatic Usage
---

The Codegen has also a complete programmatic, you can use it if you need to customize the execution flow, or if you are writing a tool that uses the codegen.

### Basic Programmatic Usage

In order to use the programmatic API, start by importing `codegen` from `@graphql-codegen/core`:

```ts
import { codegen } from '@graphql-codegen/core';
```

Then, create a configuration object ([complete signature](https://github.com/dotansimha/graphql-code-generator/blob/master/packages/graphql-codegen-core/src/codegen.ts#L7-L16)):

```ts
import { buildSchema } from 'graphql';
import * as fs from 'fs';
import * as typescriptPlugin from '@graphql-codegen/typescript';
import { printSchema, parse, GraphQLSchema } from 'graphql';

const schema: GraphQLSchema = buildSchema(`type A {}`);
const outputFile = 'relative/pathTo/filename.ts';
const config = {
  // used by a plugin internally, although the 'typescript' plugin currently
  // returns the string output, rather than writing to a file
  filename: outputFile,
  schema: parse(printSchema(schema)), 
  plugins: [ // Each plugin should be an object
    {
      typescript: {}, // Here you can pass configuration to the plugin
    },
  ],
  pluginMap: {
    typescript: typescriptPlugin,
  },
};
```

> The `schema` field be a valid `GraphQLSchema` object. If you need to load your GraphQL schema from a external source (file, url), you can use `loadSchema` from `graphql-toolkit`.

Notice that a plugin name key in `pluginMap` and `plugins` must match to identify a plugin and its configuration.

> You need to import the plugin in your favorite way, you can also use `await import` to lazy load it.

Then, provide the config object to `codegen`:

```ts
const output = await codegen(config);
fs.writeFile(path.join(__dirname, outputFile), output, () => {
  console.log('Outputs generated!');
});
```

> We are using this API in the live demo in GraphQL Code Generator website, [here is the code](https://github.com/dotansimha/graphql-code-generator/blob/master/website/live-demo/src/App.js#L79).
