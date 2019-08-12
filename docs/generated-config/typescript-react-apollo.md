
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

### apolloReactCommonImportFrom (`string`, default value: `apollo/react-common`)





### apolloReactComponentsImportFrom (`string`, default value: `apollo/react-components`)





### apolloReactHocImportFrom (`string`, default value: `apollo/react-hoc`)





### apolloReactHooksImportFrom (`string`, default value: `apollo/react-hooks`)





### componentSuffix (`string`, default value: `Component`)

You can specify a suffix that gets attached to the name of the generated component.




### reactApolloVersion (`2 | 3`, default value: `2`)

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
   reactApolloVersion: 3
```

### withResultType (`boolean`, default value: `true`)

Customized the output by enabling/disabling the generated result type.


#### Usage Example

```yml
generates:
path/to/file.ts:
 plugins:
   - typescript
   - typescript-operations
   - typescript-react-apollo
 config:
   withResultType: true
```

### withMutationOptionsType (`boolean`, default value: `true`)

Customized the output by enabling/disabling the generated mutation option type.


#### Usage Example: yml
generates:
path/to/file.ts:
 plugins:
   - typescript
   - typescript-operations
   - typescript-react-apollo
 config:
   withMutationOptionsType: true

