---
'@graphql-codegen/plugin-helpers': patch
'@graphql-codegen/cli': patch
---

Widen `Types.SchemaWithLoaderOptions['loader']` to accept a custom loader function (`CustomSchemaLoaderFn`) in addition to a path string.

A per-entry `schema` custom loader (`{ '<pointer>': { loader, ...options } }`) is resolved by `@graphql-tools/load`'s `useCustomLoader`, which already accepts either a path string (resolved via `require()`) or a function value at runtime (`typeof loaderPointer === 'function'`). Only the TypeScript type restricted `loader` to `string`, forcing consumers who pass an imported loader function (or a class instance exposing a bound `loader` property) to cast the `schema` array to bypass the type error, even though it worked correctly at runtime.

This is additive and backward compatible — `loader: string` continues to type-check exactly as before.

Also fixes a schema-cache collision for function loaders in `@graphql-codegen/cli`: the cache key is `JSON.stringify(schemaPointerMap)`, and `JSON.stringify` drops functions, so two `generates` targets using different loader functions for the same pointer (`{ 'schema.graphql': { loader: fnA } }` vs `{ loader: fnB }`) both keyed as `{"schema.graphql":{}}` and the second silently reused the first's schema. Function values are now keyed by object identity (via the existing `getJsObjectId`), so distinct loaders load separately while one function reused across targets still loads once.
