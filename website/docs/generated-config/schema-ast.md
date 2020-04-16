
### includeDirectives (`boolean`, default value: `false`)

Include directives to Schema output.


#### Usage Example

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

### commentDescriptions (`boolean`, default value: `false`)

Set to true in order to print description as comments (using # instead of """)


#### Usage Example

```yml
schema: http://localhost:3000/graphql
generates:
  schema.graphql:
    plugins:
      - schema-ast
    config:
      commentDescriptions: true
```