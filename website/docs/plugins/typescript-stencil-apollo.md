---
id: typescript-stencil-apollo
title: TypeScript Stencil Apollo
---

This plugin generates Stencil Apollo functional components typings. It extends the basic TypeScript template [`@graphql-codegen/typescript`](typescript) and thus shares a similar configuration.


{@import ../plugins/client-note.md}

## Installation

    $ yarn add -D @graphql-codegen/typescript-stencil-apollo

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

## Configuration


{@import ../generated-config/base-visitor.md}

{@import ../generated-config/client-side-base-visitor.md}

{@import ../generated-config/typescript-stencil-apollo.md}
