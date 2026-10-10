---
'@graphql-codegen/visitor-plugin-common': patch
---

Keep the local definition of a fragment when the same fragment is also passed as an external fragment, so its `*FragmentDoc` is generated again. This fixes `near-operation-file` output for a fragment declared in one `gql` tag and spread by an operation in another `gql` tag of the same file.
