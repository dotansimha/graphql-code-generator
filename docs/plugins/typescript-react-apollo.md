---
id: typescript-react-apollo
title: TypeScript React Apollo
---

This plugin generates React Apollo components and HOC with TypeScript typings. It extends the basic TypeScript template [`@graphql-codegen/typescript`](typescript-typings) and thus shares a similar configuration.

## Installation

    $ yarn add @graphql-codegen/typescript-react-apollo @types/graphql

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
  <TestComponent variables={...}>
    ...
  </TestComponent>
```

Or if you prefer:

```tsx
  const withTestData = withTestQuery(...);
```

## Configuration

{@import: ../docs/generated-config/base-visitor.md}
{@import: ../docs/generated-config/client-side-base-visitor.md}
{@import: ../docs/generated-config/typescript-react-apollo.md}
