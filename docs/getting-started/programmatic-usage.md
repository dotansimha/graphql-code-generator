---
id: programmatic-usage
title: Programmatic Usage
---

The Codegen has also a complete programmatic, you can use it if you need to customize the execution flow, or if you are writing a tool that uses the codegen.

### Basic Programmatic Usage

In order to use the programmatic API, start by importing `generate` from `graphql-code-generator`:

```ts
import { generate } from 'graphql-code-generator';
```

Then, create a configuration object, match [`Types.Config`](https://github.com/dotansimha/graphql-code-generator/blob/2b6610b9a4770d76e3ef322ca3adfbd371dadf83/packages/graphql-codegen-core/src/yml-config-types.ts#L41-L52) from `graphql-code-generator`, for example:

```ts
const config = {
  overwrite: true,
  schema: ['schema.graphql'],
  generates: {
    'output.ts': {
      plugins: ['typescript']
    }
  }
};
```

Then, provide the config object to `generate`:

```ts
const output = await generate(config);
```

The output of `generate` is an array with the output file path and the file contant. It also saves the output to the file.

If you wish not to save the output to a file, you can provide `false` as the 2nd argument:

```ts
const output = await generate(config, false);
```

### Custom Plugin Loader

By defaut, the codegen tries to find the specified plugins under `node_modules` by using `require` to load them.

If you are using a different environment that doesn't able to use `require` (such as, client side packages that can't use require during runtime), you can specify a custom `pluginLoader` field in your config file, and load the plugins in your prefered way:

```ts
const config = {
  pluginLoader: pluginName => {
    if (pluginName === 'typescript') {
      return {
        plugin: () => {
          // overwrite plugin here
        }
      };
    }
  },
  schema: ['schema.graphql'],
  generates: {
    'output.ts': {
      plugins: ['typescript']
    }
  }
};
```
