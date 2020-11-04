---
'@graphql-codegen/visitor-plugin-common': patch
---

Expose `_hasRequiredVariables` to `buildOperation` in order to allow better type-safety for plugins that deals with `variables`
