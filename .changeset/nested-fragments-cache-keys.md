---
'@graphql-codegen/visitor-plugin-common': patch
'@graphql-codegen/typescript-operations': patch
---

Fix out-of-memory errors with deeply nested, widely reused fragments (#10940).

The type cache used while generating selection set types was keyed by every fragment-expanded field
path, so its keys grew exponentially with fragment nesting. Keys are now built from the selection
set as written, referencing fragment spreads by name, so they stay linear in the size of the
documents. The exported `getFieldNames` helper from `@graphql-codegen/visitor-plugin-common`, which
built those expanded paths, is removed.
