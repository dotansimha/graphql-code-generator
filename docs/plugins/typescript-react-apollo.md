---
id: typescript-react-apollo
title: TypeScript React Apollo
---

This plugin generates React Apollo components and HOC with TypeScript typings. It extends the basic TypeScript template [`graphql-codegen-typescript-common`](typescript-typings) and thus shares a similar configuration.

## Installation

Install using `npm` (or `yarn`):

    $ npm install graphql-codegen-typescript-react-apollo

## Usage

For the given input:

```graphql
query Test {
  feed {
    id
    commentCount
    repository {
      full_name
      html_url
      owner {
        avatar_url
      }
    }
  }
}
```

We can use the generated code like this:

```tsx
  <Test.Component variables={...}>
    ...
  </Test.Component>
```

Or if you prefer:

```tsx
  const withTestData = Test.HOC(...);
```

## Configuration

#### `noHOC` (default value: `false`)

This will disable the higher order components generation.

#### `noComponents` (default value: `false`)

This will cause the code generator to _omit_ React **Components**. So, in case you are just using _hooks_, you can disable the Components setting this option to `true`.

#### `withHooks` (default value: `false`)

This will cause the codegen to add React **Hooks** implementations, to be used in conjunction with [`react-apollo-hooks`](https://github.com/trojanowski/react-apollo-hooks). The generated code will wrap base `useQuery` and `useMutation` hooks with TypeScript typings.

You can use the generated hook in your Functional Component like this:

```tsx
  const { data, loading, error } = Test.use(...);
```

Or if you are using `noNamespaces` option:

```tsx
  const { data, loading, error } = useTest(...);
```

#### `withSubscriptionHooks` (default value: `false`)

This will cause the codegen to add React **Hooks** for _Subscriptions_.

> This feature requires a polyfill when using `react-apollo-hooks` versions prior to 0.4.1. See `importUseSubscriptionsFrom`.

#### `importUseSubscriptionFrom`

The polyfill can be defined by adding a `importUseSubscriptionFrom` option specifying the path (relative to generated file) where the `useSubscription` function and the `SubscriptionHookOptions<T, TVariables>` type may be found.

For example if you have defined `useSubscription` in the `react-apollo-subscriptions.tsx` file, you can use:

```yaml
withHooks: true
withSubscriptionHooks: true
importUseSubscriptionFrom: './react-apollo-subscriptions'
```

> This option allows using the experimental useSubscription hooks when used with `react-apollo-hooks` with versions prior to 0.4.1. You can find an actual implementation [here](https://github.com/Urigo/WhatsApp-Clone-Client-React/blob/master/src/polyfills/react-apollo-hooks.ts) or from [this issue](https://github.com/trojanowski/react-apollo-hooks/pull/37) on `react-apollo-hooks`.
