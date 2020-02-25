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

### customResolverFn (`string`, default value: `"(parent: TParent, args: TArgs, context: TContext, info: GraphQLResolveInfo) => Promise<TResult> | TResult"`)

You can provide your custom ResolverFn instead of the default one.

The default is:

```typescript
export type ResolverFn<TResult, TParent, TContext, TArgs> = (parent: TParent, args: TArgs, context: TContext, info: GraphQLResolveInfo) => Promise<TResult> | TResult;
```

Most of the time, this is not needed, and `customResolveInfo` is enough to modify the `info`.

One reason for this can be to make it compatible with other libraries in which the resolver functions are different than the rest, and for example the `info` type depends on the `TParent`.

One example of this kind of libraries is Postgraphile, in which `info`'s type is:

```typescript
  info: GraphQLResolveInfo & {
    graphile: GraphileHelpers<TParent>;
  }
```

#### Usage Example

```yml
generates:
path/to/file.ts:
  plugins:
    - typescript
    - typescript-resolvers
  config:
    customResolverFn: |
      (
        parent: TParent,
        args: TArgs,
        context: TContext,
        info: GraphQLResolveInfo & { stuff: Stuff<TParent> }
      ) => Promise<TResult> | TResult;
```

it will generate

```typescript
export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo & { stuff: Stuff<TParent> }
) => Promise<TResult> | TResult;
```
