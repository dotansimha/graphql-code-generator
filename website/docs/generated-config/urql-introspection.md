This plugin generates an introspection file for Schema Awareness feature of Urql Cache Exchange

You can read more about it in `urql` documentation: https://formidable.com/open-source/urql/docs/graphcache/schema-awareness/.

Urql Introspection plugin accepts a TypeScript / JavaScript or a JSON file as an output _(`.ts, .tsx, .js, .jsx, .json`)_.

Both in TypeScript and JavaScript a default export is being used.

> The output is based on the output you choose for the output file name.

## Installation



<img alt="urql-introspection plugin version" src="https://img.shields.io/npm/v/@graphql-codegen/urql-introspection?color=%23e15799&label=plugin&nbsp;version&style=for-the-badge"/>


    
:::shell Using `yarn`
    yarn add -D @graphql-codegen/urql-introspection
:::

## API Reference

### `module`

type: `string (values: commonjs, es2015)`
default: `es2015`

Compatible only with JSON extension, allow you to choose the export type, either `module.exports` or `export default`.  Allowed values are: `commonjs`,  `es2015`.

#### Usage Examples

```yml
generates:
path/to/file.json:
 plugins:
   - urql-introspection
 config:
   module: commonjs
```

### `useTypeImports`

type: `boolean`
default: `false`

Will use `import type {}` rather than `import {}` when importing only types. This gives
compatibility with TypeScript's "importsNotUsedAsValues": "error" option

Note that `useTypeImports` would only work on `TypeScript` environments, on every other it would errors out during config validation.

#### Usage Examples

```yml
generates:
path/to/file.ts:
 plugins:
   - urql-introspection
 config:
   useTypeImports: true
```
