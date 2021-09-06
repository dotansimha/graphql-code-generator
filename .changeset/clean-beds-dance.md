---
'@graphql-codegen/typescript-react-query': major
---

Change `fetchParams` configuration option from object to string.The string will be inserted 1:1 into the generated code. This is a breaking change!

This allows more flexibility for customization. Here are some examples:

**Use an imported object for configuration**

```yaml
schema: MY_SCHEMA_PATH
documents: './src/**/*.graphql'
generates:
  ./generates.ts:
    plugins:
      - add:
          content: "import { endpointUrl, fetchParams } from './my-config';"
      - typescript
      - typescript-operations
      - typescript-react-query
    config:
      fetcher:
        endpoint: 'endpointUrl'
        fetchParams: 'fetchParams'
```

**Use environment variables for configuration**

```yaml
schema: MY_SCHEMA_PATH
documents: './src/**/*.graphql'
generates:
  ./generates.ts:
    plugins:
      - typescript
      - typescript-operations
      - typescript-react-query
    config:
      fetcher:
        endpoint: 'endpointUrl'
        # Multiline string
        fetchParams: >
          {
            headers: {
              apiKey: process.env.APIKEY,
              somethingElse: process.env.SOMETHING,
            },
          }
```
