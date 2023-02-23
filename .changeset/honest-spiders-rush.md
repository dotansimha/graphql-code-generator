---
'@graphql-codegen/cli': patch
---

only run generate for files that users have listed in config to avoid running this over every change that codegen is not supposed to execute
