# @graphql-codegen/typescript-urql

## 2.0.0
### Major Changes

- 7f2bf153: Prefer generating React Hooks over React data components by default
  
  ## Breaking Changes
  
  The default configuration for this plugins has changed to:
  
  ```yaml
  config:
    withHooks: true
    withComponent: false
  ```
  
  If you are using the generated Component from that plugin, you can turn it on by adding `withComponent: true` to your configuration.

### Patch Changes

- Updated dependencies [4266a15f]
  - @graphql-codegen/visitor-plugin-common@1.17.12
