---
'@graphql-codegen/client-preset': patch
---

Omit `__typename` from being added on the root node of a subscription when using `addTypenameSelectionDocumentTransform` with documentTransforms since a single root node is expected and the code generator fails because of that (refer to https://spec.graphql.org/draft/#sec-Single-root-field)
