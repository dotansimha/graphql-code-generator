
### baseTypesPath (`string`)

Required, should point to the base schema types file. The key of the output is used a the base path for this file.


#### Usage Example

```yml
generates:
src/:
 preset: near-operation-file
 presetConfig:
   baseTypesPath: types.ts
 plugins:
   - typescript-operations
```

### extension (`string`, default value: `.generates.ts`)

Optional, sets the extension for the generated files. Use this to override the extension if you are using plugins that requires a different type of extensions (such as `typescript-react-apollo`)


#### Usage Example

```yml
generates:
src/:
 preset: near-operation-file
 presetConfig:
   baseTypesPath: types.ts
   extension: .generated.tsx
 plugins:
   - typescript-operations
   - typescript-react-apollo
```

### cwd (`string`, default value: `process.cwd()`)

Optional, override the `cwd` of the execution. We are using `cwd` to figure out the imports between files. Use this if your execuion path is not your project root directory.


#### Usage Example

```yml
generates:
src/:
 preset: near-operation-file
 presetConfig:
   baseTypesPath: types.ts
   cwd: /some/path
 plugins:
   - typescript-operations
```

### importTypesNamespace (`string`, default value: `Types`)

Optional, override the name of the import namespace used to import from the `baseTypesPath` file.


#### Usage Example

```yml
generates:
src/:
 preset: near-operation-file
 presetConfig:
   baseTypesPath: types.ts
   importTypesNamespace: SchemaTypes
 plugins:
   - typescript-operations
```