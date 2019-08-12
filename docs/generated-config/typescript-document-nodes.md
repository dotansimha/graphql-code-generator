
### namingConvention (`NamingConvention`, default value: `change-case#pascalCase`)

Allow you to override the naming convention of the output. You can either override all namings, or specify an object with specific custom naming convention per output. The format of the converter must be a valid `module#method`. You can also use "keep" to keep all GraphQL names as-is. Additionally you can set `transformUnderscore` to `true` if you want to override the default behaviour, which is to preserve underscores.


#### Usage Example: Override All Names

```yml
config:
  namingConvention: change-case#lowerCase
```
#### Usage Example: Upper-case enum values

```yml
config:
  namingConvention: change-case#pascalCase
```
#### Usage Example: Keep

```yml
config:
  namingConvention: keep
```
#### Usage Example: Transform Underscores

```yml
config:
  namingConvention: change-case#pascalCase
  transformUnderscore: true
```

### namePrefix (`string`, default value: `''`)

Adds prefix to the name


#### Usage Example

```yml
 generates: src/api/user-service/queries.ts
 documents: src/api/user-service/queries.graphql
 plugins:
   - graphql-codegen-typescript-document-nodes
 config:
   namePrefix: 'gql'
```

### nameSuffix (`string`, default value: `''`)

Adds suffix to the name


#### Usage Example

```yml
 generates: src/api/user-service/queries.ts
 documents: src/api/user-service/queries.graphql
 plugins:
   - graphql-codegen-typescript-document-nodes
 config:
   nameSuffix: 'Query'
```