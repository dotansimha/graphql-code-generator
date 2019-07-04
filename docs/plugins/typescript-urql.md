---
id: typescript-urql
title: TypeScript Urql
---

This plugin generates [`urql`](https://github.com/FormidableLabs/urql) components and HOC with TypeScript typings.

## Installation

    $ yarn add @graphql-codegen/typescript-urql @types/graphql

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
{@import: ../docs/generated-config/typescript-urql.md}
