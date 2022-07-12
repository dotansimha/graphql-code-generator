---
id: add
---

`add` plugin adds custom text to your output file.

You can use this plugin to add custom code, imports, comments and more to your output file.

{@apiDocs}

## Examples

```yaml
# ...
generates:
  path/to/file.ts:
    plugins:
      - add:
          content: '/* eslint-disable */'
      - typescript
```

```yaml
# ...
generates:
  path/to/file.ts:
    plugins:
      - add:
          content:
            - 'declare namespace GraphQL {'
      - add:
          placement: 'append'
          content: '}'
      - typescript
```
