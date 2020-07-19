## Installation

:::shell Using `yarn`

    $ yarn add -D @graphql-codegen/named-operations-object

:::

## API Reference

### `identifierName`

type: `string`
default: `namedOperations`

Allow you to customize the name of the exported identifier

#### Usage Examples

```yml
generates:
path/to/file.ts:
 plugins:
   - typescript
   - typescript-named-operations-object
 config:
   identifierName: ListAllOperations
```