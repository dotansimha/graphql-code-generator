## Installation



<img alt="time plugin version" src="https://img.shields.io/npm/v/@graphql-codegen/time?color=%23e15799&label=plugin&nbsp;version&style=for-the-badge"/>


    
:::shell Using `yarn`
    yarn add -D @graphql-codegen/time
:::

## API Reference

### `format`

type: `string`
default: `YYYY-MM-DDTHH:mm:ssZ`

Customize the Moment format of the output time.

#### Usage Examples

```yml
generates:
path/to/file.ts:
 plugins:
   - time:
       format: DD.MM.YY
```

### `message`

type: `string`
default: `'Generated on'`

Customize the comment message

#### Usage Examples

```yml
generates:
path/to/file.ts:
 plugins:
   - time:
       message: "The file generated on: "
```