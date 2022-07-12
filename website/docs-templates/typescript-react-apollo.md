---
id: typescript-react-apollo
---

{@operationsNote}

{@apiDocs}

## Usage Example

### With React Hooks

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

And the following configuration:

```yaml
schema: YOUR_SCHEMA_HERE
documents: './src/**/*.graphql'
generates:
  ./generated-types.ts:
    plugins:
      - typescript
      - typescript-operations
      - typescript-react-apollo
```

Codegen will pre-compile the GraphQL operation into a `DocumentNode` object, and generate a ready-to-use React Hook for each operation you have.

In your application code, you can import it from the generated file, and use the React Hook in your component code:

```tsx
import { useTest } from './generated-types'

export const MyComponent: React.FC = () => {
  const { data, error, loading } = useTest()

  return <div> ... </div>
}
```

### Generate Data Component

Codegen also supports generating data Components (deprecated in `@apollo/client` v3), you can turn it on this way:

```yaml
config:
  withComponent: true
```

### Generate HOC

Codegen also supports generating High-Order-Components (deprecated in `@apollo/client` v3), you can turn it on this way:

```yaml
config:
  withHOC: true
```

> Watch [Episode #29 of `graphql.wtf`](https://graphql.wtf/episodes/29-apollo-client-3-with-graphql-code-generator) for a quick introduction to using this plugin with GraphQL Code Generator:

<iframe
  width="100%"
  height="400"
  src="https://www.youtube.com/embed/PYDGjTufGsk"
  title="YouTube video player"
  frameBorder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowFullScreen
></iframe>
