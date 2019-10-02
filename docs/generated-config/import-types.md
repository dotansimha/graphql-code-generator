
### baseTypesPath (`string`)

Required, should point to the base schema types file. The key of the output is used a the base path for this file.


#### Usage Example

```yml
generates:
path/to/file.ts:
 preset: import-types
 presetConfig:
   typesPath: types.ts
 plugins:
   - typescript-operations
```

### importTypesNamespace (`string`, default value: `Types`)

Optional, override the name of the import namespace used to import from the `baseTypesPath` file.


#### Usage Example

```yml
generates:
src/:
 preset: import-types
 presetConfig:
   typesPath: types.ts
   importTypesNamespace: SchemaTypes
 plugins:
   - typescript-operations
```