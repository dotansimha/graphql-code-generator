---
'@graphql-codegen/typescript-graphql-request': patch
---

Fix rawRequest return type

The errors property from the return type has been removed, because it is never
returned by `graphql-request`. Instead, failed requests throw a `ClientError`.
Also, data is no longer optional, because it always exists for successful responses.
