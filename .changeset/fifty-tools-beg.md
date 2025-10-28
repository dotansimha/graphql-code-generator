---
'@graphql-codegen/typed-document-node': minor
---

feat(typed-document-node): Allow importing operation types

Adds the `importOperationTypesFrom` option, similar to many other codegen
plugins. This allows importing the operation types rather than needing to
generate them within this plugin config.
