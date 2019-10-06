
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