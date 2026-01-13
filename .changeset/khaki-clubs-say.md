---
'@graphql-codegen/typescript-operations': patch
---

Only generate `Exact` utility type at the top if it is used

`Exact` utility is only used to wrap variables types for operations (queries, mutations and subscriptions) if they exist in the document. `Exact` is never used when there are _only_ fragments.

This is important to conditionally generate as users may use very strict tsconfig that will fail compiling if there are unused types.
