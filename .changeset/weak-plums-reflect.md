---
'@graphql-codegen/visitor-plugin-common': minor
'@graphql-codegen/typescript-resolvers': minor
---

Allow overwriting the resolver type signature based on directive usages.

**WARNING:** Using this option does only change the generated type definitions.

For actually ensuring that a type is correct at runtime you will have to use schema transforms (e.g. with [@graphql-tools/utils mapSchema](https://www.graphql-tools.com/docs/schema-directives)) that apply those rules! Otherwise, you might end up with a runtime type mismatch which could cause unnoticed bugs or runtime errors.

```yml
config:
  # This was possible before
  customResolverFn: ../resolver-types.ts#UnauthenticatedResolver
  # This is new
  directiveResolverMappings:
    authenticated: ../resolvers-types.ts#AuthenticatedResolver
```

Example Schema:

```graphql
directive @authenticated on FIELD_DEFINITION

type Query {
  yee: String
  foo: String @authenticated
}
```
