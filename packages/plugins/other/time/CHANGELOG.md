# @graphql-codegen/time

## 2.0.0

### Major Changes

- bc6e5c08: Update plugin configuration API to use object only (`string` is no longer supported)

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

## 1.17.10

### Patch Changes

- ee2b01a3: Fixes for issues with publish command

## 1.17.9

### Patch Changes

- 6cb9c96d: Fixes issues with previous release

## 1.17.8

### Patch Changes

- bccfd28c: Fix issues with adding time to .graphql files
