# @graphql-codegen/typescript-apollo-angular

## 2.0.0
### Major Changes

- bf29f132: Support Apollo Angular 2.0 by default
  
  ## Breaking Changes
  
  The default supported version of this plugin is `v2` of `apollo-angular`.
  
  If you are still using v1, you should add this to your configuration:
  
  ```yaml
  config:
    apolloAngularVersion: 1
  ```

### Minor Changes

- bf29f132: Allow to define the Injector of the generated SDK class in Apollo Angular plugin

### Patch Changes

- b9113daf: Fix Dependency Injection issue in Apollo Angular when targeting ES5
- Updated dependencies [4266a15f]
  - @graphql-codegen/visitor-plugin-common@1.17.12
