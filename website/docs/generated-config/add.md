## Installation



<img alt="add plugin version" src="https://img.shields.io/npm/v/@graphql-codegen/add?color=%23e15799&label=plugin&nbsp;version&style=for-the-badge"/>


    
:::shell Using `yarn`
    yarn add -D @graphql-codegen/add
:::

## API Reference

### `placement`

type: `string (values: append, content, prepend)`
default: `prepend`

Allow you to choose where to add the content.


### `content`

type: `string[] | string`

The actual content you wish to add, either a string or array of strings.
You can also specify a path to a local file and the content if it will be loaded by codegen.
