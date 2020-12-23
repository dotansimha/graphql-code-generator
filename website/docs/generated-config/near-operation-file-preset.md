## Installation



<img alt="near-operation-file-preset plugin version" src="https://img.shields.io/npm/v/@graphql-codegen/near-operation-file-preset?color=%23e15799&label=plugin&nbsp;version&style=for-the-badge"/>


    
:::shell Using `yarn`
    yarn add -D @graphql-codegen/near-operation-file-preset
:::

## API Reference

### `baseTypesPath`

type: `string`

Required, should point to the base schema types file.
The key of the output is used a the base path for this file.

If you wish to use an NPM package or a local workspace package, make sure to prefix the package name with `~`.

#### Usage Examples

```yml
generates:
src/:
 preset: near-operation-file
 presetConfig:
   baseTypesPath: types.ts
 plugins:
   - typescript-operations
```

### `importAllFragmentsFrom`

type: `string,object`

Overrides all external fragments import types by using a specific file path or a package name.

If you wish to use an NPM package or a local workspace package, make sure to prefix the package name with `~`.

#### Usage Examples

```yml
generates:
src/:
 preset: near-operation-file
 presetConfig:
   baseTypesPath: types.ts
   importAllFragmentsFrom: '~types'
 plugins:
   - typescript-operations
```

### `extension`

type: `string`
default: `.generated.ts`

Optional, sets the extension for the generated files. Use this to override the extension if you are using plugins that requires a different type of extensions (such as `typescript-react-apollo`)

#### Usage Examples

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

### `cwd`

type: `string`
default: `process.cwd()`

Optional, override the `cwd` of the execution. We are using `cwd` to figure out the imports between files. Use this if your execuion path is not your project root directory.

#### Usage Examples

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

### `folder`

type: `string`
default: `''`

Optional, defines a folder, (Relative to the source files) where the generated files will be created.

#### Usage Examples

```yml
generates:
src/:
 preset: near-operation-file
 presetConfig:
   baseTypesPath: types.ts
   folder: __generated__
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
 preset: near-operation-file
 presetConfig:
   baseTypesPath: types.ts
   importTypesNamespace: SchemaTypes
 plugins:
   - typescript-operations
```