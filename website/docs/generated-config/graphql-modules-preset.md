## Installation



<img alt="graphql-modules-preset plugin version" src="https://img.shields.io/npm/v/@graphql-codegen/graphql-modules-preset?color=%23e15799&label=plugin&nbsp;version&style=for-the-badge"/>


    
:::shell Using `yarn`
    yarn add -D @graphql-codegen/graphql-modules-preset
:::

## API Reference

### `baseTypesPath`

type: `string`

Required, should point to the base schema types file.
The key of the output is used a the base path for this file.


### `importBaseTypesFrom`

type: `string`

Overrides the package import for the base types. Use this if you are within a monorepo and you wish
to import the base types directly from a different package, and not from a relative path.


### `cwd`

type: `string`
default: `process.cwd()`

Optional, override the `cwd` of the execution. We are using `cwd` to figure out the imports between files. Use this if your execuion path is not your project root directory.


### `importTypesNamespace`

type: `string`
default: `Types`

Optional, override the name of the import namespace used to import from the `baseTypesPath` file.


### `filename`

type: `string`

Required, sets the file name for the generated files.


### `encapsulateModuleTypes`

type: `string`
default: `namespace`

Configure how to encapsulate the module types, to avoid confusion.

`namespace` (default): will wrap all types in a TypeScript namespace, using the module name.
`prefix`: will prefix all types from a specific module with the module name.
`none`: will skip encapsulation, and generate type as-is.
