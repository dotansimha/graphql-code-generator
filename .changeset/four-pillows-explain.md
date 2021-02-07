---
'@graphql-codegen/c-sharp': minor
---

This release adds support to optionally emit c# 9 records instead of classes.

To enable this, add `emitRecords: true` to your codegen yaml or json configuration file. Example:

```yaml
schema: './types.graphql'
generates:
  ./src/types.cs:
    plugins:
    - c-sharp
config:
    namespaceName: My.Types
    emitRecords: true
    scalars:
      DateTime: DateTime
```