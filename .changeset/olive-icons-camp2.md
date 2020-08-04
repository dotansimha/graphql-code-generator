---
'@graphql-codegen/add': major
---

Update plugin configuration API to use object only (`string` is no longer supported)

## Migration Notes

#### Before

```yaml
plugins:
  - add: 'some string'
```

#### After

```yaml
plugins:
  - add:
      content: 'some string'
```

