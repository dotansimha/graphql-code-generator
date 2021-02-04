This plugin generates TypeScript typings for `.graphql` files containing GraphQL documents, which later on can be consumed using [`graphql-tag/loader`](https://github.com/apollographql/graphql-tag#webpack-preprocessing-with-graphql-tagloader) or use `string` types if you will use the operations as raw strings, and get type-check and type-safety for your imports. This means that any time you import objects from `.graphql` files, your IDE will provide auto-complete.

This plugin also handles `.graphql` files containing multiple GraphQL documents, and name the imports according to the operation name.

> ⚠ Fragments are not generated with named imports, only as default imports, due to `graphql-tag/loader` behavior.

## Installation



<img alt="typescript-graphql-files-modules plugin version" src="https://img.shields.io/npm/v/@graphql-codegen/typescript-graphql-files-modules?color=%23e15799&label=plugin&nbsp;version&style=for-the-badge"/>


    
:::shell Using `yarn`
    yarn add -D @graphql-codegen/typescript-graphql-files-modules
:::

## API Reference

### `modulePathPrefix`

type: `string`
default: ``

Allows specifying a module definition path prefix to provide distinction
between generated types.

#### Usage Examples

```yml
generates: src/api/user-service/queries.d.ts
 documents: src/api/user-service/queries.graphql
 plugins:
   - typescript-graphql-files-modules
 config:
   # resulting module definition path glob: "*\/api/user-service/queries.graphql"
   modulePathPrefix: "/api/user-service/"
```

### `relativeToCwd`

type: `boolean`
default: `false`

By default, only the filename is being used to generate TS module declarations. Setting this to `true` will generate it with a full path based on the CWD.


### `prefix`

type: `string`
default: `*\/`

By default, a wildcard is being added as prefix, you can change that to a custom prefix


### `type`

type: `string (values: DocumentNode, string)`
default: `DocumentNode`

By default, the named exports will have a type `DocumentNode`. Change this to "string" if you only use raw strings.
