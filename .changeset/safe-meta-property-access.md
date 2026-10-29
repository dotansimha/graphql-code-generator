---
'@graphql-codegen/client-preset': patch
---

Fix safe property access on `__meta__` in `isFragmentReady` when using `documentMode: 'string'` to avoid TS4111 under `noPropertyAccessFromIndexSignature`.
