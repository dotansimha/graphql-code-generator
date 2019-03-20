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
import { plugin as typescriptPlugin } from '@graphql-codegen/typescript';

const config = {
  schema: buildSchema(`type A {}`)
  plugins: {
    typescript: {}, // Here you can pass configuration to the plugin
  },
  pluginMap: {
    typescript: typescriptPlugin,
  }
};
```

> You need to import the plugin in your favorite way, you can also use `await import` to lazy load it.

Then, provide the config object to `codegen`:

```ts
const output = await codegen(config);
```

The output of `codegen` is an array with the output file path and the file contant.

> We are using this API in the live demo in GraphQL Code Generator website, [here is the code](https://github.com/dotansimha/graphql-code-generator/blob/master/website/live-demo/src/App.js#L79).
