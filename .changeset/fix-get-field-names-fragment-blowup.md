---
'@graphql-codegen/visitor-plugin-common': patch
---

Fix an exponential slowdown (and out-of-memory crash on large schemas) in `getFieldNames()` when a document has fragments nested inside other fragments that are reused multiple times (e.g. `near-operation-file` + `typescript-operations` with widely-shared fragments). A fragment's field names were recomputed from scratch on every `FRAGMENT_SPREAD` instead of being computed once per fragment and reused, so the work doubled at every level of fragment nesting. Fragment field names are now memoized per fragment name for the lifetime of a single `getFieldNames()` call.
