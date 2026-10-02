---
'@graphql-codegen/plugin-helpers': patch
---

Widen `Types.SchemaWithLoaderOptions['loader']` to accept a custom loader function (`CustomSchemaLoaderFn`) in addition to a path string.

A per-entry `schema` custom loader (`{ '<pointer>': { loader, ...options } }`) is resolved by `@graphql-tools/load`'s `useCustomLoader`, which already accepts either a path string (resolved via `require()`) or a function value at runtime (`typeof loaderPointer === 'function'`). Only the TypeScript type restricted `loader` to `string`, forcing consumers who pass an imported loader function (or a class instance exposing a bound `loader` property) to cast the `schema` array to bypass the type error, even though it worked correctly at runtime.

This is additive and backward compatible — `loader: string` continues to type-check exactly as before.
