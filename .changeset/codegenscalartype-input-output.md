---
'@graphql-codegen/visitor-plugin-common': minor
---

Support an object form for the `codegenScalarType` scalar extension.

A scalar's `extensions.codegenScalarType` can now be either a string (applied to both the `input` and `output` types, as before) or `{ input, output }` to map the two positions independently — matching what the `scalars` config option already accepts. This lets schema-first scalar libraries declare a stricter parsed/input type than the accepted resolver-return/output type directly from the schema, instead of collapsing both into one type.
