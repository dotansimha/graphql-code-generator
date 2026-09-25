---
'@graphql-codegen/add': patch
---

The plugin output's `content` is now an empty string (`''`) instead of `null` when `placement` is `prepend` or `append`. This matches the `ComplexPluginOutput` type (`content: string`). Code that calls the plugin directly and checks `content === null` should check for an empty string instead. Generated files are unchanged.
