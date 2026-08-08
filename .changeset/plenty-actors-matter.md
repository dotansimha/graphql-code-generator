---
'@graphql-codegen/visitor-plugin-common': patch
'@graphql-codegen/client-preset': patch
---

Revert Partial handling when conditional fragment and fragment masking are used

This is causing all masked fields to be optional due to how function type override works.
