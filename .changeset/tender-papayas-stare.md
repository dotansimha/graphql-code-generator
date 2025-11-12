---
'@graphql-codegen/visitor-plugin-common': patch
---

Handle schema extension nodes correctly

When a schema doesn't have an operation type defined but has `schema extension` definitions with directives like below,
schema extensions are not converted to schema definitions by GraphQL Tools.
So the visitor should handle schema extension nodes correctly.

Follow-up to https://github.com/ardatan/graphql-tools/pull/7679

```graphql
extend schema @link(url: "https://specs.apollo.dev/federation/v2.0", import: ["@key"])

type Foo {
  id: ID! @key
  name: String
}
```
