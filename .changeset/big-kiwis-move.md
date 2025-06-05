---
"@graphql-codegen/cli": patch
"@graphql-codegen/plugin-helpers": patch
---

Allow functions to be passed as valid values for `UrlSchemaOptions.customFetch`. This was already possible, but the type definitions did not reflect that correctly.
