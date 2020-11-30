---
id: programmatic-usage
title: Programmatic Usage
---

The codegen has also a complete programmatic API. You can use it if you need to customize the execution flow, or if you are writing a tool that uses the codegen.

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

> The `schema` field be a valid `GraphQLSchema` object. If you need to load your GraphQL schema from a external source (file, url), you can use `loadSchema` from `@graphql-tools/load`.

Notice that a plugin name key in `pluginMap` and `plugins` must match to identify a plugin and its configuration.

> You need to import the plugin in your favorite way, you can also use `await import` to lazy load it.

Then, provide the config object to `codegen`:

```ts
const output = await codegen(config);
fs.writeFile(path.join(__dirname, outputFile), output, () => {
  console.log('Outputs generated!');
});
```

:::info
We are using this API in the live demo in GraphQL Code Generator website. [The code is here](https://github.com/dotansimha/graphql-code-generator/blob/master/website/src/components/live-demo/generate.js).
:::

:::tip Loading schema and documents
You can use one of the tools from [`@graphql-tools`](https://github.com/ardatan/graphql-tools) for file loading, schema merging, transformations and more. 
:::

## Using the CLI instead of `core`

If you wish to have the benefits that `cli` package has (like loading schema and document files, parsing endpoints and more), you can use `require()` (or `import`) for `@graphql-codegen/cli` directly with Node.JS:

```js
import { generate } from '@graphql-codegen/cli';

async function doSomething() {
  const generatedFiles = await generate(
    {
      schema: 'http://127.0.0.1:3000/graphql',
      documents: './src/**/*.graphql',
      generates: {
        [process.cwd() + '/models/types.d.ts']: {
          plugins: ['typescript'],
        },
      },
    },
    true
  );
}
```

The return value should be of type `Promise<FileOutput[]>`.

:::caution
This usage will not work in a browser environment, because the `cli` package depends on NodeJS internals and the file system.
::: 
