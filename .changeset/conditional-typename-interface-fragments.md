---
'@graphql-codegen/visitor-plugin-common': patch
'@graphql-codegen/typescript-operations': patch
'@graphql-codegen/client-preset': patch
---

Fix `@skip`/`@include` handling of `__typename` and of inline fragments on interfaces

- `__typename` selected only with `@skip` or `@include` (on the field or on an enclosing inline fragment) is now optional, unless `nonOptionalTypename` is set
- Fields of a conditional inline fragment on an interface-typed field, or of a conditional fragment typed with an interface, are kept as optional fields instead of being dropped
