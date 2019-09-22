
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