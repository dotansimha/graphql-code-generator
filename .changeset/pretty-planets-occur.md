---
'@graphql-codegen/visitor-plugin-common': patch
'@graphql-codegen/typescript-operations': patch
---

fix incorrect type generation when using the inlineFragmentTypes 'combine' option that resulted in generating masked fragment output.
