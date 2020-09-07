---
id: typescript-urql
title: TypeScript Urql
---

{@import ../plugins/client-note.md}

{@import ../generated-config/typescript-urql.md}

## Usage Example

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
  const [ result ] = useTestQuery(...);
```

## Configuration

