---
'@graphql-codegen/typescript-urql': major
---

Prefer generating React Hooks over React data components by default

## Breaking Changes

The default configuration for this plugins has changed to:

```yaml
config:
  withHooks: true
  withComponent: false
```

If you are using the generated Component from that plugin, you can turn it on by adding `withComponent: true` to your configuration.