---
'@graphql-codegen/typescript': minor
---

Add a new option to add `// @ts-nocheck` flag to config. This allows projects to disable TypeChecking for generated files. You can enable this option in your `codegen` config file.

```yaml
  plugins:
    - typescript:
        enableTsNoCheck: true
```
