
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




### dedupeOperationSuffix (`boolean`, default value: `false`)

Set this configuration to `true` if you wish to make sure to remove duplicate operation name suffix.




### omitOperationSuffix (`boolean`, default value: `false`)

Set this configuration to `true` if you wish to disable auto add suffix of operation name, like `Query`, `Mutation`, `Subscription`, `Fragment`.



### exportFragmentSpreadSubTypes (`boolean`, default value: `false`)

If set to true, it will export the sub-types created in order to make it easier to access fields declared under fragment spread.


