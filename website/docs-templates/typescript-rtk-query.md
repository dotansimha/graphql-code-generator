---
id: typescript-rtk-query
---

{@operationsNote}

{@apiDocs}

## Usage Examples

> Note: this plugin just injects new endpoints into an existing API you created with `createApi`, so
> you still have to define that - but also have all freedom on how to do that.

### Using `graphql-request`

```yaml
schema: MY_SCHEMA_PATH
documents: './src/**/*.graphql'
generates:
  ./src/app/api/generated.ts:
    plugins:
      - typescript
      - typescript-operations
      - typescript-rtk-query:
          importBaseApiFrom: 'src/app/api/baseApi'
          exportHooks: true
```

The generated `src/app/api/generated.ts` would try to `import { api } from 'src/app/api/baseApi'`, so you have to create that file:

```ts title="src/app/api/baseApi.ts"
import { createApi } from '@reduxjs/toolkit/query/react'
import { graphqlRequestBaseQuery } from '@rtk-query/graphql-request-base-query'
import { GraphQLClient } from 'graphql-request'

export const client = new GraphQLClient('/graphql')
// highlight-start
export const api = createApi({
  baseQuery: graphqlRequestBaseQuery({ client }),
  endpoints: () => ({})
})
// highlight-end
```

From that point on, you can import the generated hooks from `src/app/api/generated.ts`:

```ts title="src/components/MyComponent.ts"
import { useMyQuery } from 'src/app/api/generated'

export const MyComponent = () => {
  // highlight-start
  const { data, isLoading } = useMyQuery({ page: 5 })
  // highlight-end
}
```

### Extending generated code

You can import the generated code into a new file and use `api.enhanceEndpoints` to add lifecycle hooks or `providesTags`/`invalidatedTags` information to your api:

```ts title="src/app/api/enhanced.ts"
import { api as generatedApi } from 'src/app/api/generated'

export const api = generatedApi.enhanceEndpoints({
  addTagTypes: ['User'],
  endpoints: {
    GetUserById: {
      providesTags: (result, error, arg) => [{ type: 'User', id: arg.userId }]
    }
  }
})

export const { useGetUserByIdQuery } = api
```

Make sure that this file is referenced from your code so that the enhanced endpoints are usable. The easiest way to do this is to re-export the hooks in this file and import them exclusively from it.

#### Setting an authentication header after a Mutation

You can also use this to set an "authentication" header after a login mutation:

```ts
import { api as generatedApi } from 'src/app/api/generated'
import { client } from 'src/app/api/baseApi'

export const api = generatedApi.enhanceEndpoints({
  endpoints: {
    Login: {
      // highlight-start
      async onQueryStarted(arg, { queryFulfilled }) {
        const { data } = await queryFulfilled
        client.setHeader('authentication', `Bearer ${data.token}`)
      }
      // highlight-end
    }
  }
})

export const { useLoginMutation } = api
```
