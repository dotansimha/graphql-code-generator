
### immutableTypes (`boolean`, default value: `false`)

Generates immutable types by adding `readonly` to properties and uses `ReadonlyArray`.


#### Usage Example

```yml
generates:
path/to/file.ts:
 plugins:
   - typescript
   - typescript-resolvers
 config:
   immutableTypes: true
```

### useIndexSignature (`boolean`, default value: `false`)

Adds an index signature to any generates resolver.


#### Usage Example

```yml
generates:
path/to/file.ts:
 plugins:
   - typescript
   - typescript-resolvers
 config:
   useIndexSignature: true
```

### noSchemaStitching (`boolean`, default value: `false`)

Disables Schema Stitching support

> The default behavior will be reversed in the next major release. Support for Schema Stitching will be disabled by default.

#### Usage Example

```yml
generates:
path/to/file.ts:
 plugins:
   - typescript
   - typescript-resolvers
 config:
   noSchemaStitching: true
```

### customResolveInfo (`string`, default value: `"graphql#GraphQLResolveInfo"`)

You can provide your custom GraphQLResolveInfo instead of the default one from graphql-js


#### Usage Example

```yml
generates:
path/to/file.ts:
 plugins:
   - typescript
   - typescript-resolvers
 config:
   customResolveInfo: ./my-types#MyResolveInfo
```