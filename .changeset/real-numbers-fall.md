---
'@graphql-codegen/visitor-plugin-common': major
'@graphql-codegen/typescript-operations': major
'@graphql-codegen/client-preset': major
---

BREAKING CHANGE: Operation plugin and Client Preset no longer generates optional `__typename` for result type

`__typenam` should not be in the request unless:

- explicitly requested by the user
- automatically injected into the request by clients, such as Apollo Clients.

Note: Apollo Client users can still use `nonOptionalTypename: true` and `skipTypeNameForRoot: true` to ensure generated types match the runtime behaviour.
