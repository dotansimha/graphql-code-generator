---
'@graphql-codegen/visitor-plugin-common': patch
---

Add special handling for identifiers that consist entirely of _ characters when transformUnderscore is true. This prevents _ values in GraphQL enums from being emitted without identifers in the resulting types.
