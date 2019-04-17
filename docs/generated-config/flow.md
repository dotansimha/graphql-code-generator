### useFlowExactObjects (`boolean`, default value: `false`)

Generates Flow types as Exact types.

#### Usage Example

```yml
generates:
path/to/file.ts:
  plugins:
    - flow
  config:
    useFlowExactObjects: true
```

### useFlowReadOnlyTypes (`boolean`, default value: `false`)

Generates read-only Flow types

#### Usage Example

```yml
generates:
path/to/file.ts:
  plugins:
    - flow
  config:
    useFlowReadOnlyTypes: true
```
