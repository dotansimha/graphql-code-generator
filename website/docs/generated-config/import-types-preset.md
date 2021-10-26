## Installation



<img alt="import-types-preset plugin version" src="https://img.shields.io/npm/v/@graphql-codegen/import-types-preset?color=%23e15799&label=plugin&nbsp;version&style=for-the-badge"/>


    
:::shell Using `yarn`
    yarn add -D @graphql-codegen/import-types-preset
:::

## API Reference

### `typesPath`

type: `string`

Required, should point to the base schema types file.
The key of the output is used a the base path for this file.

#### Usage Examples

```yml
generates:
path/to/file.ts:
 preset: import-types
 presetConfig:
   typesPath: types.ts
 plugins:
   - typescript-operations
```

### `importTypesNamespace`

type: `string`
default: `Types`

Optional, override the name of the import namespace used to import from the `baseTypesPath` file.

#### Usage Examples

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