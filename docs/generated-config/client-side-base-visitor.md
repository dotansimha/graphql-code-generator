
### noGraphQLTag (`boolean`, default value: `false`)

Instead of adding gql tag with the GraphQL operation, it uses the percompiled JSON representation (DocumentNode) of the operation.


#### Usage Example

```yml
config:
  noGraphQLTag: true
```

### gqlImport (`string`, default value: `gql#graphql-tag`)

Customize from which module will `gql` be imported from. This is useful if you want to use modules other than `graphql-tag`, e.g. `graphql.macro`.


#### Usage Example: graphql.macro

```yml
config:
  gqlImport: graphql.macro#gql
```
#### Usage Example: Gatsby

```yml
config:
  gqlImport: gatsby#graphql
```

### operationResultSuffix (`string`, default value: `""`)

Adds a suffix to generated operation result type names


