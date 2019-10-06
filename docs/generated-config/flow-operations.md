
### useFlowExactObjects (`boolean`, default value: `true`)

Generates Flow types as Exact types.


#### Usage Example

```yml
generates:
path/to/file.js:
 plugins:
   - flow
 config:
   useFlowExactObjects: false
```

### useFlowReadOnlyTypes (`boolean`, default value: `false`)

Generates read-only Flow types


#### Usage Example

```yml
generates:
path/to/file.js:
 plugins:
   - flow
 config:
   useFlowReadOnlyTypes: true
```

### flattenGeneratedTypes (`boolean`, default value: `false`)

Flatten fragment spread and inline fragments into a simple selection set before generating.


#### Usage Example

```yml
generates:
path/to/file.js:
 plugins:
   - typescript
   - typescript-operations
 config:
   flattenGeneratedTypes: true
```