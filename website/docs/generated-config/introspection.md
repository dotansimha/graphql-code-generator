This plugin generates a GraphQL introspection file based on your GraphQL schema.

## Installation



<img alt="introspection plugin version" src="https://img.shields.io/npm/v/@graphql-codegen/introspection?color=%23e15799&label=plugin&nbsp;version&style=for-the-badge"/>


    
:::shell Using `yarn`
    yarn add -D @graphql-codegen/introspection
:::

## API Reference

### `minify`

type: `boolean`
default: `false`

Set to `true` in order to minify the JSON output.

#### Usage Examples

```yml
generates:
introspection.json:
  plugins:
    - introspection
  config:
    minify: true
```

### `descriptions`

type: `boolean`
default: `true`

Whether to include descriptions in the introspection result.


### `specifiedByUrl`

type: `boolean`
default: `false`

Whether to include `specifiedByUrl` in the introspection result.


### `directiveIsRepeatable`

type: `boolean`
default: `true`

Whether to include `isRepeatable` flag on directives.


### `schemaDescription`

type: `boolean`
default: `false`

Whether to include `description` field on schema.


### `federation`

type: `boolean`

