---
"@graphql-codegen/cli": patch
---

getPluginByName fails unexpectedly when plugin is not prefixed with @graphq-codegen in ESM context

MODULE_NOT_FOUND is the error code you receive in a CommonJS context when you require() a module and it does not exist.
ERR_MODULE_NOT_FOUND is the error code you receive in an ESM context when you import or import() ad module that does not exist.
