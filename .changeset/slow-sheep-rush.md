---
'@graphql-codegen/cli': major
---

BREAKING CHANGE: Set `noSilentErrors: true` by default

When multiple files match documents pattern, and there are syntax errors in some but not others, then the operations with errors are not included in the loaded documents list by default (`noSilentErrors: false`). This is annoying for users as there is no feedback loop during development.

`noSilentErrors: true` is used as the default for Codegen users to make the feedback loop faster. It can still overriden in Codegen Config if desired.