
### preResolveTypes (`boolean`, default value: `false`)

Avoid using `Pick` and resolve the actual primitive type of all selection set.


#### Usage Example

```yml
plugins
  config:
    preResolveTypes: true
```

### globalNamespace (`boolean`, default value: `false`)

Puts all generated code under `global` namespace. Useful for Stencil integration.


#### Usage Example

```yml
plugins
  config:
    globalNamespace: true
```

### operationResultSuffix (`string`, default value: `""`)

Adds a suffix to generated operation result type names


