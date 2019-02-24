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

#### `gqlImport` (default value: `import gql from 'graphql-tag'`)

Customize from where will be `gql` imported. This is useful if you want to use eg. `graphql.macro` for inlining documents.
Note that you need to write whole import line, eg. `import { gql } from 'graphql.macro'`.

#### `withHOC` (default value: `true`)

This will disable the higher order components generation by setting this option to `false`.

#### `withComponents` (default value: `true`)

This will cause the code generator to _omit_ React **Components**. So, in case you are just using _hooks_, you can disable the Components setting this option to `false`.

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

You can specify alternative module that is exports `useQuery` `useMutation` and `useSubscription`. This is useful for further abstraction of some common tasks (eg. error handling). Filepath relative to generated file can be also specified. But if you provide only `true`, it will use `react-apollo-hooks` by default.
