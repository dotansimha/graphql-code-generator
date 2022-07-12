---
id: schema-ast
---

{@apiDocs}

## Examples

```yaml
# ...
schema:
  - 'http://localhost:3000/graphql'
  - './src/**/*.graphql'
  - 'scalar MyCustomScalar'
generates:
  path/to/file.graphql:
    plugins:
      - schema-ast
```
