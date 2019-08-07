
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




### dedupeOperationSuffix (`boolean`, default value: `false`)

Set this configuration to `true` if you wish to make sure to remove duplicate operation name suffix.




### documentMode (`'graphQLTag' | 'documentNode' | 'external'`, default value: `'graphQLTag'`)

Declares how DocumentNode are created: - `graphQLTag`: `graphql-tag` or other modules (check `gqlImport`) will be used to generate document nodes. If this is used, document nodes are generated on client side i.e. the module used to generate this will be shipped to the client - `documentNode`: document nodes will be generated as objects when we generate the templates. - `external`: document nodes are imported from an external file. To be used with `importDocumentNodeExternallyFrom`




### importDocumentNodeExternallyFrom (`string | 'near-operation-file'`, default value: `''`)

This config should be used if `documentMode` is `external`. This has 2 usage: - any string: This would be the path to import document nodes from. This can be used if we want to manually create the document nodes e.g. Use `graphql-tag` in a separate file and export the generated document - 'near-operation-file': This is a special mode that is intended to be used with `near-operation-file` preset to import document nodes from those files. If these files are `.graphql` files, we make use of webpack loader.


#### Usage Example

```yml
config:
  documentMode: external
  importDocumentNodeExternallyFrom: path/to/document-node-file
```

```yml
config:
  documentMode: external
  importDocumentNodeExternallyFrom: near-operation-file
```
