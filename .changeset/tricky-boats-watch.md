---
'@graphql-codegen/typescript-operations': patch
---

Fix performance issue when config.importSchemaTypesFrom is set, and the provided schema is still
unnecessarily visited
