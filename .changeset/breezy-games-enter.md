---
'@graphql-codegen/visitor-plugin-common': major
'@graphql-codegen/typescript-operations': major
'@graphql-codegen/client-preset': major
---

Fix nullable field optionality in operations

Previously, a nullable Result field is generated as optional (marked by `?` TypeScript modifier) by default. This is not correct, because generally at runtime such field can only be `null`, and not `undefined` (both missing from the object OR `undefined`). The only exceptions are when fields are deferred (using `@defer` directive) or marked as conditional (using `@skip` or `@include`).

Now, a nullable Result field cannot be optional unless the exceptions are met. This also limits `avoidOptionals` to only target Variables input, since some users may want to force explicit `null` when providing operation variables.
