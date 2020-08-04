This plugin generates a GraphQL introspection file based on your GraphQL schema.

## Installation



<img alt="introspection plugin version" src="https://img.shields.io/npm/v/@graphql-codegen/introspection?color=%23e15799&label=plugin&nbsp;version&style=for-the-badge"/>


    
:::shell Using `yarn`
    $ yarn add -D @graphql-codegen/introspection
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

### `federation`

type: `boolean`

