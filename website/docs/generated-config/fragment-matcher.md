
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