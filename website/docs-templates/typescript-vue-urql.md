---
id: typescript-vue-urql
---

{@operationsNote}

{@apiDocs}

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
const { data } = useTestQuery(...)
```

## Configuration
