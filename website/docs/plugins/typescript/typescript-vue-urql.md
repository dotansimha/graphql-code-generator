---
id: typescript-vue-urql
title: TypeScript Vue Urql
---

{@import ./docs/plugins/client-note.md}

{@import ./docs/generated-config/typescript-vue-urql.md}

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

```ts
  const { data } = useTestQuery(...);
```

## Configuration
