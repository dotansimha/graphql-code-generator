---
'@graphql-codegen/visitor-plugin-common': minor
'@graphql-codegen/typescript-resolvers': minor
---

[typescript-resolvers] Add `resolversNonOptionalTypename` config option.

This is extending on `ResolversUnionTypes` implemented in https://github.com/dotansimha/graphql-code-generator/pull/9069

`resolversNonOptionalTypename` adds non-optional `__typename` to union members of `ResolversUnionTypes`, without affecting the union members' base intefaces.

A common use case for non-optional `__typename` of union members is using it as the common field to work out the final schema type. This makes implementing the union's `__resolveType` very simple as we can use `__typename` to decide which union member the resolved object is. Without this, we have to check the existence of field/s on the incoming object which could be verbose.

For example, consider this schema:

```graphql
type Query {
  book(id: ID!): BookPayload!
}

type Book {
  id: ID!
  isbn: String!
}

type BookResult {
  node: Book
}

type PayloadError {
  message: String!
}

union BookPayload = BookResult | PayloadError
```

*With optional `__typename`:* We need to check existence of certain fields to resolve type in the union resolver:

```ts
// Query/book.ts
export const book = async () => {
  try {
    const book = await fetchBook();
    // 1. No `__typename` in resolver results...
    return {
      node: book
    }
  } catch(e) {
     return {
       message: "Failed to fetch book"
     }
  }
}

// BookPayload.ts
export const BookPayload = {
  __resolveType: (parent) => {
    // 2. ... means more checks in `__resolveType`
    if('message' in parent) {
      return 'PayloadError';
    }
    return 'BookResult'
  }
}
```

*With non-optional `__typename`:* Resolvers declare the type. This which gives us better TypeScript support in resolvers and simplify `__resolveType` implementation:

```ts
// Query/book.ts
export const book = async () => {
  try {
    const book = await fetchBook();
    // 1. `__typename` is declared in resolver results...
    return {
      __typename: 'BookResult', // 1a. this also types `node` for us 🎉
      node: book
    }
  } catch(e) {
     return {
       __typename: 'PayloadError',
       message: "Failed to fetch book"
     }
  }
}

// BookPayload.ts
export const BookPayload = {
  __resolveType: (parent) => parent.__typename, // 2. ... means a very simple check in `__resolveType`
}
```

*Using `resolversNonOptionalTypename`:* add it into `typescript-resolvers` plugin config:

```ts
// codegen.ts
const config: CodegenConfig = {
  schema: 'src/schema/**/*.graphql',
  generates: {
    'src/schema/types.ts': {
      plugins: ['typescript', 'typescript-resolvers'],
      config: {
        resolversNonOptionalTypename: true // Or `resolversNonOptionalTypename: { unionMember: true }`
      }
    },
  },
};
```
