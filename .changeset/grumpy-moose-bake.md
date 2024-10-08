---
'@graphql-codegen/visitor-plugin-common': minor
'@graphql-codegen/typescript-resolvers': minor
---

Add avoidCheckingAbstractTypesRecursively to avoid checking and generating abstract types recursively

For users that already sets recursive default mappers e.g. `Partial<{T}>` or `DeepPartial<{T}>`, having both options on will cause a nested loop which eventually crashes Codegen. In such case, setting `avoidCheckingAbstractTypesRecursively: true` allows users to continue to use recursive default mappers as before.
