
### module (`string`, default value: `es2015`)

Compatible only with JSON extension, allow you to choose the export type, either `module.exports` or `export default`.  Allowed values are: `commonjs`,  `es2015`.


#### Usage Example

```yml
generates:
path/to/file.json:
 plugins:
   - fragment-matcher
 config:
   module: commonjs
```

### apolloClientVersion (`number`, default value: `2`)

Compatible only with TS/TSX/JS/JSX extensions, allow you to generate output based on your Apollo-Client version. Valid values are: `2`, `3`.


#### Usage Example

```yml
generates:
path/to/file.ts:
 plugins:
   - fragment-matcher
 config:
   apolloClientVersion: 3
```

### useExplicitTyping (`boolean`, default value: `false`)

Create an explicit type based on your schema. This can help IDEs autofill your fragment matcher. This is mostly useful if you do more with your fragment matcher than just pass it to an Apollo-Client.


#### Usage Example

```yml
generates:
path/to/file.ts:
 plugins:
   - fragment-matcher
 config:
   useExplicitTyping: true
```