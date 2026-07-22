---
'@graphql-codegen/visitor-plugin-common': patch
'@graphql-codegen/typescript-operations': patch
---

Fix conditional directive (`@skip` and `@include`) incorrectly drop fields in Result when used on
Inline Fragment / Fragment Spread
