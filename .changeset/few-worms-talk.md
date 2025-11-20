---
"@graphql-codegen/visitor-plugin-common": patch
---

fix: allow mappers to override root types (Query, Mutation, Subscription)

Previously, mappers configured for root types were ignored because root types were checked before mappers. This fix moves the mapper check before the root type check, allowing mappers to override `rootValueType` when configured.
