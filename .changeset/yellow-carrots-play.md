---
'@graphql-codegen/cli': major
'@graphql-codegen/plugin-helpers': major
---

BREAKING CHANGE - `config.generates` no longer takes `ConfiguredPlugin[]`, takes `ConfiguredOutput[]`
instead

`config.generates`'s previous typing allowed a value to be an array e.g.

```
generates: {
  "src/gql/generated.ts": [{ typescript: {} }]
}
```

However, this never worked because this config is eventually passed into `normalizeOutputParam` which previously had this bug in the implementation:

```ts
export function normalizeOutputParam(config){
  // 0. When config is an array...
  if (isOutputConfigArray(config)) { // 1. `isOutputConfigArray(config)` was `Array.isArray(config)` -> returns true
    return {
      documents: [],
      schema: [],
      plugins: isConfiguredOutput(config) ? config.plugins : config, // 2. ‼️ `isConfiguredOutput(config)` was `typeof config === 'object'` -> returns true. This is a bug because we are accessing `plugins` property of an array, which will ALWAYS be `undefined` -> the output is always rejected as "Invalid Codegen Configuration"
    };
  }
  if (isConfiguredOutput(config)) {
    return config;
  }
  throw new Error(`Invalid "generates" config!`);
}
```

Now, an array is still accepted, but as `ConfiguredOutput[]` instead. For this major version release, only the first array element is used, and `@graphql-codegen/cli` logs a warning when there is more than one element.

`normalizeOutputParam` now returns `ConfiguredOutput[]` instead of a single `ConfiguredOutput`.

`@graphql-codegen/cli` also throws its "Invalid Codegen Configuration" error when a `generates` array is empty or its first element is not a config object. This error is now a single generic message, no longer naming the output file, and it shows a TypeScript `CodegenConfig` example with the `ConfiguredOutput` shape instead of the old YAML plugin-list example.
