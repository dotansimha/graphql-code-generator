---
'@graphql-codegen/typescript-operations': minor
'@graphql-codegen/visitor-plugin-common': minor
---

Add `enumType: 'native-with-string-values'`. Enums are declared as native enums, and operation variables and input object fields accept either the enum member or its string value (``E | `${E}` ``).
