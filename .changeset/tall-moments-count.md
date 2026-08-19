---
'@graphql-codegen/plugin-helpers': minor
'@graphql-codegen/cli': minor
---

Extend `overwrite` with `overwrite.removeStaleFiles` and `overwrite.updateExistingFiles`

`overwrite` was being used to both remove stale files in watch mode and update existing files. Some plugins such as Server Preset may dynamically return files to write between watch runs (for performance purposes).

The `overwrite` can now take an object with `overwrite.removeStaleFiles` and `overwrite.updateExistingFiles` fields to allow granular control over actions.

This is not a breaking change because `overwrite=true|false` still works.

