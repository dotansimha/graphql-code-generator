
### modulePathPrefix (`string`, default value: `''`)

Allows specifying a module definiton path prefix to provide distinction between generated types.


#### Usage Example

```yml
generates: src/api/user-service/queries.d.ts
 documents: src/api/user-service/queries.graphql
 plugins:
   - typescript
   - typescript-graphql-files-modules
 config:
   # resulting module definition path glob: "*\/api/user-service/queries.graphql"
   modulePathPrefix: "/api/user-service/"
```

### relativeToCwd (`boolean`, default value: `false`)

By default, only the filename is being used to generate TS module declarations. Setting this to `true` will generate it with a full path based on the CWD.




### prefix (`string`, default value: `*`)

By default, a wildcard is being added as prefix, you can change that to a custom prefix


