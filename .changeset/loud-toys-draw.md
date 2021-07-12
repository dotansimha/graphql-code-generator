---
'@graphql-codegen/cli': patch
'@graphql-codegen/plugin-helpers': patch
---

don't require plugins for for config if preset provides plugin. Instead the preset should throw if no plugins were provided.
