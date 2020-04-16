
### namingConvention (`NamingConvention`, default value: `pascal-case#pascalCase`)

Allow you to override the naming convention of the output. You can either override all namings, or specify an object with specific custom naming convention per output. The format of the converter must be a valid `module#method`. Allowed values for specific output are: `typeNames`, `enumValues`. You can also use "keep" to keep all GraphQL names as-is. Additionally you can set `transformUnderscore` to `true` if you want to override the default behaviour, which is to preserves underscores.


#### Usage Example: Override All Names

```yml
config:
  namingConvention: lower-case#lowerCase
```
#### Usage Example: Upper-case enum values

```yml
config:
  namingConvention:
    typeNames: pascal-case#pascalCase
    enumValues: upper-case#upperCase
```
#### Usage Example: Keep

```yml
config:
  namingConvention: keep
```
#### Usage Example: Remove Underscores

```yml
config:
  namingConvention:
    typeNames: pascal-case#pascalCase
    transformUnderscore: true
```

### namePrefix (`string`, default value: `''`)

Adds prefix to the name


#### Usage Example

```yml
 documents: src/api/user-service/queries.graphql
 generates:
   src/api/user-service/queries.ts:
   plugins:
     - typescript-document-nodes
   config:
     namePrefix: 'gql'
```

### nameSuffix (`string`, default value: `''`)

Adds suffix to the name


#### Usage Example

```yml
 documents: src/api/user-service/queries.graphql
 generates:
   src/api/user-service/queries.ts:
   plugins:
     - typescript-document-nodes
   config:
     nameSuffix: 'Query'
```