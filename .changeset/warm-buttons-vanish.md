---
'@graphql-codegen/typescript-urql-graphcache': patch
---

Fixes a bug where the mutation root type name was hardcoded as `Mutation` creating incorrectly named types. Now, the correct mutation type as defined in the schema is used.
