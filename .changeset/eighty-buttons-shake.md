---
'@graphql-codegen/fragment-matcher': patch
---

Introspect a copy of the schema without `@defer` and `@stream`

`graphql@17`'s `execute()` rejects any schema that declares `@defer` or `@stream`, even when the document does not use them. The plugin's introspection query never does, so the directives are now stripped before executing it. The schema is only rebuilt when one of them is declared, so output is unchanged otherwise.
