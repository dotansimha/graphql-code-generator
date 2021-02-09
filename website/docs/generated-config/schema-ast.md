This plugin prints the merged schema as string. If multiple schemas are provided, they will be merged and printed as one schema.

## Installation



<img alt="schema-ast plugin version" src="https://img.shields.io/npm/v/@graphql-codegen/schema-ast?color=%23e15799&label=plugin&nbsp;version&style=for-the-badge"/>


    
:::shell Using `yarn`
    yarn add -D @graphql-codegen/schema-ast
:::

## API Reference

### `includeDirectives`

type: `boolean`
default: `false`

Include directives to Schema output.

#### Usage Examples

```yml
schema:
  - './src/schema.graphql'
generates:
  path/to/file.graphql:
    plugins:
      - schema-ast
    config:
      includeDirectives: true
```

### `commentDescriptions`

type: `boolean`
default: `false`

Set to true in order to print description as comments (using # instead of """)

#### Usage Examples

```yml
schema: http://localhost:3000/graphql
generates:
  schema.graphql:
    plugins:
      - schema-ast
    config:
      commentDescriptions: true
```

### `sort`

type: `boolean`
default: `false`

Set to true in order get the schema lexicographically sorted before printed.


### `federation`

type: `boolean`

