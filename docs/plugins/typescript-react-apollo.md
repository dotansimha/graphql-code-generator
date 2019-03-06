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

Customize from which module will `gql` be imported from. This is useful if you want to use modules other than `graphql-tag`, e.g. `graphql.macro`. You can also control the imported GraphQL-parse function identifier e.g. `gatsby#graphql`, which will result in `import { graphql as gql } from 'gatsby'`.

#### `noHOC` (default value: `false`)

This will disable the higher order components generation.sable the higher order components generation by setting this option to `false`.

#### `noComponents` (default value: `false`)

This will cause the code generator to _omit_ React **Components**. So, in case you are just using _hooks_, you can disable the Components setting this option to `true`.

#### `withHooks` (default value: `false`)

This will cause the codegen to add React **Hooks** implementations, to be used in conjunction with [`react-apollo-hooks`](https://github.com/trojanowski/react-apollo-hooks). The generated code will wrap base `useQuery` and `useMutation` hooks with TypeScript typings.

You can use the generated hook in your Functional Component like this:

```tsx
  const { data, loading, error } = useTest(...);
```

#### `hooksImportFrom` (default value: `react-apollo-hooks`)

You can specify alternative module that is exports `useQuery` `useMutation` and `useSubscription`. This is useful for further abstraction of some common tasks (eg. error handling). Filepath relative to generated file can be also specified.
