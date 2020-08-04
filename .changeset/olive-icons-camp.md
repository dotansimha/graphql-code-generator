---
'@graphql-codegen/time': major
---

Update plugin configuration API to use object only (`string` is no longer supported)

## Migration Notes

This only effects developers who used to override the `format`. You now need to specify it with a key!

#### Before

```yaml
plugins:
  - time: 'DD-MM-YYYY'
```

#### After

```yaml
plugins:
  - time:
      format: 'DD-MM-YYYY'
```

