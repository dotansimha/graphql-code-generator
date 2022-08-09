---
'@graphql-codegen/typescript-generic-sdk': major
---

- Respect GraphQL Live Queries like Subscriptions and use the stream return types (`AsyncIterable` or `Observable`).
- Previously if there was no `usingObservableFrom` set in the configuration, the plugin was using `Promise` as subscriptions' return type, and this is wrong. Now it uses `AsyncIterable` in this case.
