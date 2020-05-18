
### identifierName (`string`, default value: `namedOperations`)

Allow you to customize the name of the exported identifier


#### Usage Example

```yml
generates:
path/to/file.ts:
 plugins:
   - typescript
   - typescript-named-operations-object
 config:
   identifierName: ListAllOperations
```