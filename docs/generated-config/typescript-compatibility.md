
### noNamespaces (`boolean`, default value: `false`)

Does not generate TypeScript `namepsace`s and uses the operation name as prefix.


#### Usage Example

```yml
generates:
path/to/file.ts:
 plugins:
   - typescript
   - typescript-operations
   - typescript-compatibility
 config:
   noNamespaces: true
```

### strict (`boolean`, default value: `false`)

Make sure to genereate code that compatible with TypeScript strict mode.


#### Usage Example

```yml
generates:
path/to/file.ts:
 plugins:
   - typescript
   - typescript-operations
   - typescript-compatibility
 config:
   strict: true
```

### preResolveTypes (`boolean`, default value: `false`)

Avoid using `Pick` in `typescript-operations` and make sure to optimize this package as well.


