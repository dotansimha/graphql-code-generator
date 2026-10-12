---
'@graphql-codegen/visitor-plugin-common': minor
'@graphql-codegen/typed-document-node': minor
---

Add `documentMode: 'plainString'`. Documents are generated as plain template strings with fragments embedded, instead of `TypedDocumentString` instances. No class, import or type cast is generated, so each document is typed as `string`.
