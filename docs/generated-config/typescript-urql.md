### withComponent (`boolean`, default value: `true`)

Customized the output by enabling/disabling the generated Component.

#### Usage Example

```yml
generates:
path/to/file.ts:
  plugins:
    - typescript
    - typescript-operations
    - typescript-urql
  config:
    withComponent: false
```

### withHooks (`boolean`, default value: `false`)

Customized the output by enabling/disabling the generated React Hooks.

#### Usage Example

```yml
generates:
path/to/file.ts:
  plugins:
    - typescript
    - typescript-operations
    - typescript-urql
  config:
    withHooks: false
```

### urqlImportFrom (`string`, default value: `urql`)

You can specify module that exports components `Query`, `Mutation`, `Subscription` and HOCs This is useful for further abstraction of some common tasks (eg. error handling). Filepath relative to generated file can be also specified.
