---
'@graphql-codegen/typescript-operations': patch
---

Fix `typescript-operations` emitting an unused `import type * as Types from '...'` (with `importSchemaTypesFrom`) or an unused local enum/input declaration (without it) when `inlineFragmentTypes` is `'combine'` or `'mask'` and the generated file only ever references a schema type through a fragment spread that collapses to a bare `FooFragment` reference, never naming the type itself. The schema-type import/declaration decision, and the enum/scalar re-export decisions, are now based on the schema types actually named by this file's own generated output, rather than every schema type reachable through the document (including via fragments defined elsewhere).
