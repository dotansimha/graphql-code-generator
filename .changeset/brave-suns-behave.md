---
'@graphql-codegen/visitor-plugin-common': minor
'@graphql-codegen/typescript': minor
'@graphql-codegen/typescript-resolvers': minor
---

Allow declaring Argument and InputType field mappings based on directive annotations.

**WARNING:** Using this option does only change the type definitions.

For actually ensuring that a type is correct at runtime you will have to use schema transforms (e.g. with [@graphql-tools/utils mapSchema](https://www.graphql-tools.com/docs/schema-directives)) that apply those rules! Otherwise, you might end up with a runtime type mismatch which could cause unnoticed bugs or runtime errors.

Please use this configuration option with care!

```yml
plugins
  config:
    directiveArgumentAndInputFieldMappings:
      asNumber: number
```

```graphql
directive @asNumber on ARGUMENT_DEFINITION | INPUT_FIELD_DEFINITION

input MyInput {
  id: ID! @asNumber
}

type User {
  id: ID!
}

type Query {
  user(id: ID! @asNumber): User
}
```

Usage e.g. with `typescript-resolvers`

```ts
const Query: QueryResolvers = {
  user(_, args) {
    // args.id is of type 'number'
  },
};
```
