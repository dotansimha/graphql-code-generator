
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

### wrapFieldDefinitions (`boolean`, default value: `true`)

Set to `true` in order to wrap field definitions with `FieldWrapper`. This is useful to allow return types such as Promises and functions. Needed for compatibility with `federation: true` when


#### Usage Example: Enable wrapping fields

```yml
generates:
path/to/file.ts:
 plugins:
   - typescript
 config:
   wrapFieldDefinitions: false
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

### customResolverFn (`string`, default value: `"(parent: TParent, args: TArgs, context: TContext, info: GraphQLResolveInfo) = Promise | TResult"`)

You can provide your custom ResolveFn instead the default. It has to be a type that uses the generics TResult, TParent, TContext, TArgs


#### Usage Example

```yml
generates:
path/to/file.ts:
 plugins:
   - typescript
   - typescript-resolvers
 config:
   customResolverFn: ./my-types#MyResolveFn
```

#### Usage Example

```yml
generates:
path/to/file.ts:
 plugins:
   - add: "import { GraphileHelpers } from 'graphile-utils/node8plus/fieldHelpers';"
   - typescript
   - typescript-resolvers
 config:
   customResolverFn: |
     (
       parent: TParent,
       args: TArgs,
       context: TContext,
       info: GraphQLResolveInfo & { graphile: GraphileHelpers<TParent> }
     ) => Promise<TResult> | TResult;
```