## Installation



<img alt="typescript-rtk-query plugin version" src="https://img.shields.io/npm/v/@graphql-codegen/typescript-rtk-query?color=%23e15799&label=plugin&nbsp;version&style=for-the-badge"/>


    
:::shell Using `yarn`
    yarn add -D @graphql-codegen/typescript-rtk-query
:::

## API Reference

### `importBaseApiFrom`

type: `string`

Define where to import the base api to inject endpoints into

#### Usage Examples

```yml
generates:
  ./src/app/api/generated.ts:
    plugins:
      - typescript
      - typescript-operations
      - typescript-rtk-query:
          importBaseApiFrom: 'src/app/api/baseApi'
```

### `exportHooks`

type: `boolean`
default: `false`

Whether to export React Hooks from the generated api. Enable only when using the `"@reduxjs/toolkit/query/react"` import of `createApi`

#### Usage Examples

```yml
generates:
  ./src/app/api/generated.ts:
    plugins:
      - typescript
      - typescript-operations
      - typescript-rtk-query:
          importBaseApiFrom: 'src/app/api/baseApi'
          exportHooks: true
```

### `overrideExisting`

type: `string`
default: `undefined`

Sets the `overrideExisting` option, for example to allow for hot module reloading when running graphql-codegen in watch mode.
Will directly be injected as code.

#### Usage Examples

```yml
generates:
  ./src/app/api/generated.ts:
    plugins:
      - add:
          content: 'module.hot?.accept();'
      - typescript
      - typescript-operations
      - typescript-rtk-query:
          importBaseApiFrom: 'src/app/api/baseApi'
          overrideExisting: 'module.hot?.status() === "apply"'
```