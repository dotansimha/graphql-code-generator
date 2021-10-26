---
id: schema-ast
title: Schema AST
---

{@import ./docs/generated-config/schema-ast.md}

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

