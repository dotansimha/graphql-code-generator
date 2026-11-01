---
'@graphql-codegen/schema-ast': major
---

BREAKING CHANGE: Remove the `commentDescriptions` option from `SchemaASTConfig`. It has had no effect since graphql 16, which no longer prints descriptions as comments. Delete it from your `schema-ast` config; the generated output does not change.
