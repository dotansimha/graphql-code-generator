---
id: typescript-stencil-apollo
title: TypeScript Stencil Apollo
---

This plugin generates Stencil Apollo functional components typings. It extends the basic TypeScript template [`@graphql-codegen/typescript-common`](typescript-typings) and thus shares a similar configuration.

{@import: ../docs/plugins/client-note.md}

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
  <Test.Component variables={...} onReady={...} />
```

## Configuration

{@import: ../docs/generated-config/base-visitor.md}
{@import: ../docs/generated-config/client-side-base-visitor.md}
{@import: ../docs/generated-config/typescript-stencil-apollo.md}
