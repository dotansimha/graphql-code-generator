# TypeScript React Apollo Template

This template generates React Apollo components and HOC with TypeScript typings.
This template is extended version of TypeScript template, so the configuration is same with `graphql-codegen-typescript-template`.

- Example Input

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

- Example Usage

```tsx
  <Test.Component variables={...}>
    ...
  </Test.Component>
```

or

```tsx
  const withTestData = Test.HOC(...);
```
