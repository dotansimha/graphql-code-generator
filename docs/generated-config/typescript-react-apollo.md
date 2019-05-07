### withHOC (`boolean`, default value: `true`)

Customized the output by enabling/disabling the HOC.

#### Usage Example

```yml
generates:
path/to/file.ts:
  plugins:
    - typescript
    - typescript-operations
    - typescript-react-apollo
  config:
    withHOC: false
```

### withComponent (`boolean`, default value: `true`)

Customized the output by enabling/disabling the generated Component.

#### Usage Example

```yml
generates:
path/to/file.ts:
  plugins:
    - typescript
    - typescript-operations
    - typescript-react-apollo
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
    - typescript-react-apollo
  config:
    withHooks: false
```

### withMutationFn (`boolean`, default value: `true`)

Customized the output by enabling/disabling the generated mutation function signature.

#### Usage Example

```yml
generates:
path/to/file.ts:
  plugins:
    - typescript
    - typescript-operations
    - typescript-react-apollo
  config:
    withMutationFn: true
```

### hooksImportFrom (`string`, default value: `react-apollo-hooks`)

You can specify alternative module that is exports `useQuery` `useMutation` and `useSubscription`. This is useful for further abstraction of some common tasks (eg. error handling). Filepath relative to generated file can be also specified.

### reactApolloImportFrom (`string`, default value: `react-apollo`)

You can specify module that exports components `Query`, `Mutation`, `Subscription` and HOCs This is useful for further abstraction of some common tasks (eg. error handling). Filepath relative to generated file can be also specified.
