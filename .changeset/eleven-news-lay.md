---
'@graphql-codegen/typed-document-node': minor
'@graphql-codegen/visitor-plugin-common': minor
'@graphql-codegen/typescript-operations': minor
'@graphql-codegen/typescript': minor
'@graphql-codegen/typescript-resolvers': minor
'@graphql-codegen/client-preset': minor
---

Add `@defer` directive support

When a query includes a deferred fragment field, the server will return a partial response with the non-deferred fields first, followed by the remaining fields once they have been resolved.

Once start using the `@defer` directive in your queries, the generated code will automatically include support for the directive.

```jsx
// src/index.tsx
import { graphql } from './gql'
const OrdersFragment = graphql(`
  fragment OrdersFragment on User {
    orders {
      id
      total
    }
  }
`)
const GetUserQuery = graphql(`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      name
      ...OrdersFragment @defer
    }
  }
`)
```

The generated type for `GetUserQuery` will have information that the fragment is _incremental,_ meaning it may not be available right away.

```tsx
// gql/graphql.ts
export type GetUserQuery = { __typename?: 'Query'; id: string; name: string } & ({
  __typename?: 'Query'
} & {
  ' $fragmentRefs'?: { OrdersFragment: Incremental<OrdersFragment> }
})
```

Apart from generating code that includes support for the `@defer` directive, the Codegen also exports a utility function called `isFragmentReady`. You can use it to conditionally render components based on whether the data for a deferred
fragment is available:

```jsx
const OrdersList = (props: { data: FragmentType<typeof OrdersFragment> }) => {
  const data = useFragment(OrdersFragment, props.data);
  return (
    // render orders list
  )
};

function App() {
  const { data } = useQuery(GetUserQuery);
  return (
    {data && (
      <>
        {isFragmentReady(GetUserQuery, OrdersFragment, data)
					&& <OrdersList data={data} />}
      </>
    )}
  );
}
export default App;
```
