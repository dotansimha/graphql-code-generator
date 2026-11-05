---
'@graphql-codegen/plugin-helpers': minor
---

PoC: add optional `schema` and `documents` to `Types.ComplexPluginOutput`, which replace the schema and documents later `generates` stages receive; later stages get a `schemaAst` built from the returned `schema`
