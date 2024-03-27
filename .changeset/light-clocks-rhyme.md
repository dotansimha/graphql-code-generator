---
'@graphql-codegen/client-preset': minor
---

The \_\_typename should not be added to the root node of a subscription when using addTypenameSelectionDocumentTransform with documentTransforms since a single root node is expected and the code generator fails because of that (refer to https://spec.graphql.org/draft/#sec-Single-root-field)
