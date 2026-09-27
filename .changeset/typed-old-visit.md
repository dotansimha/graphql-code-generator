---
'@graphql-codegen/plugin-helpers': minor
'@graphql-codegen/typescript-operations': patch
'@graphql-codegen/typescript': patch
---

Type `oldVisit`'s return value instead of returning `any`. For a `DocumentNode`, the result is now `OldVisitDocumentResult`, whose `definitions` are `unknown[]` because leave visitors can replace each definition with any value (usually a string), and definitions without a leave visitor stay as AST nodes. When a `Document` leave visitor returns its own value, pass its type as `oldVisit<TResult>(...)`. For other roots, the result is `unknown` unless `TResult` is given.

Code that used the result as `any`, for example `const definitions: string[] = result.definitions`, now needs to filter for strings or pass `oldVisit<any>(...)`. Generated output is unchanged.
