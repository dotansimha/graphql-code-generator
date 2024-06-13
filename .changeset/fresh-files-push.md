---
'@graphql-codegen/client-preset': minor
---

Support discriminating `null` and `undefined` within the `useFragment` function.

```ts
function MyComponent(props: FragmentType<typeof MyFragment> | null) {
  const data = useFragment(MyFragment, props)
  // data is `MyFragment | null`
}

function MyComponent(props: FragmentType<typeof MyFragment> | undefined) {
  const data = useFragment(MyFragment, props)
  // data is `MyFragment | undefined`
}
```

Before, the returned type from `useFragment`  was always `TType | null | undefined`.
