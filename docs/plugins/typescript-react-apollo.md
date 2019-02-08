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

#### `withHooks` (default value: `false`)

This will cause the codegen to add React **Hooks** implementations, to be used in conjunction with [`react-apollo-hooks`](https://github.com/trojanowski/react-apollo-hooks). The generated code will wrap base `useQuery` and `useMutation` hooks with TypeScript typings.

You can use the generated hook in your Functional Component like this:

```tsx
  const { data, loading, error } = Test.useQuery(...);
```
