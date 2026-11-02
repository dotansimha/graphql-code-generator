---
'@graphql-codegen/visitor-plugin-common': patch
'@graphql-codegen/typescript': patch
'@graphql-codegen/typescript-operations': patch
---

Fix `typesPrefix` being applied to enum keys when generating enums as `const` (`enumsAsConst: true` or `enumType: 'const'`)
