---
'@graphql-codegen/testing': patch
---

Replace unmaintained `graphql-helix` dependency with `graphql-yoga` in the internal `mockGraphQLServer` test utility. `graphql-helix` has had no releases in years; `graphql-yoga` is actively maintained and already used elsewhere in this monorepo. This is an internal implementation detail — the `mockGraphQLServer` function signature is unchanged.
