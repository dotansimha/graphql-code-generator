---
'@graphql-codegen/visitor-plugin-common': minor
'@graphql-codegen/typescript-operations': minor
---

Add support for declarationKind for typescript-operations

- Input: can only be `type` or  `interface`
- Variables: no support. It must always be `type` because it's an alias e.g. `Variables = Exact<{ something: type }>`
- Result: can only be `type` or `interface`
  - Note: when `extractAllFieldsToTypes:true` or `extractAllFieldsToTypesCompact:true`, Results are used as type alias, so they are forced to be `type`. There is a console warning for users.
