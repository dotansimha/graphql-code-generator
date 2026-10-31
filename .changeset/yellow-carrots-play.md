---
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

However, this never worked because this config is eventually passed into `normalizeOutputParam` which previously had this bug in the implementation implementation:

```ts
export function normalizeOutputParam(config){
  // 0. When config config is an array...
  if (isOutputConfigArray(config)) { // 1. `isOutputConfigArray(config)` was `Array.isArray(config)` -> returns true
    return {
      documents: [],
      schema: [],
      plugins: isConfiguredOutput(config) ? config.plugins : config, // 2. ‼️ `isConfiguredOutput(config)` was `typeof config === 'object'` -> returns true. This is a bug because we are accessing `plugins` property of an array, which will ALWAYS be `undefined` -> runtime error
    };
  }
  if (isConfiguredOutput(config)) {
    return config;
  }
  throw new Error(`Invalid "generates" config!`);
}
```

Now, an array is still accepted, but as `ConfiguredOutput[]` instead. For this major versino release, only the first array element is used.
