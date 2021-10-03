---
id: typescript-react-query
title: TypeScript React-Query
---

{@import ../plugins/client-note.md}

{@import ../generated-config/typescript-react-query.md}

## Usage Examples

> Note: all generated hooks are just wrappers around `react-query` original functions. This codegen plugin just burns the generated TypeScript types into the operation, and provides flexibility to choose your `fetcher`.

### Using default `fetch`

By default, this plugin will generate a `fetcher` based on the environment global `fetch` definition.

```yml
schema: MY_SCHEMA_PATH
documents: './src/**/*.graphql'
generates:
  ./generates.ts:
    plugins:
      - typescript
      - typescript-operations
      - typescript-react-query
    config:
      fetcher: fetch
```

To use the generate hooks, import it, and then specify the endpoint and optionally `fetchParams`:

```ts
import { useMyQuery } from './generated';

export const MyComponent = () => {
  const { status, data, error, isFetching } = useMyQuery({
    endpoint: 'http://localhost:3000/graphql',
    fetchParams: {
      headers: {
        'My-Header': 'XYZ',
      },
    },
  });
};
```

### Using `fetch` with Codegen configuration

If you wish to avoid specifying `endpoint` and `fetchParams` on each hook usage, you can specify those in the `codegen.yml` file:

```yml
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
        endpoint: 'http://localhost:3000/graphql'
        fetchParams:
          headers:
            My-Header: SomeValue
```

And if you wish to have more control over the value, or even provide it in runtime, you can use environment variables:

```yml
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
        endpoint: 'process.env.ENDPOINT'
```

You can even use a custom variable from your code, and add custom imports with `add` plugin:

```yml
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

The generated hooks doesn't require you to specify anything, you can just use it as-is:

```ts
import { useMyQuery } from './generated';

export const MyComponent = () => {
  const { status, data, error, isFetching } = useMyQuery({});
};
```

### Using `graphql-request`

If you are using `graphql-request`, you can set `fetcher` to `graphql-request`, and then the generated React Hook will expect you to pass the `GraphQLClient` instance (created by `graphql-request` library).

```yml
schema: MY_SCHEMA_PATH
documents: './src/**/*.graphql'
generates:
  ./generates.ts:
    plugins:
      - typescript
      - typescript-operations
      - typescript-react-query
    config:
      fetcher: graphql-request
```

And the, while using, provide your `client` instance:

```ts
import { useMyQuery } from './generated';
import { client } from './my-graphql-request-client';

export const MyComponent = () => {
  const { status, data, error, isFetching } = useMyQuery(client, {});
};
```

### Using Custom Fetcher

If you wish to create a custom fetcher, you can provide your own function as a Mapper string (`file#identifier`). Codegen will take care of importing it and use it as a fetcher.

```yml
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
        func: './my-file#myFetcher'
        isReactHook: false # optional, defaults to false, controls the function's signature. Read below
```

As a shortcut, the `fetcher` property may also directly contain the function as a mapper string:
```yml
    #...
    config:
      fetcher: './my-file#myFetcher' # isReactHook is false here (the default version)
```

Codegen will use `myFetcher`, and you can just use the hook directly:

```ts
import { useMyQuery } from './generated';

export const MyComponent = () => {
  const { status, data, error, isFetching } = useMyQuery({});
};
```

Depending on the `isReactHook` property, your `myFetcher` should be in the following signature:
* `isReactHook: false`
  ```ts
  type MyFetcher<TData, TVariables> = (operation: string, variables?: TVariables): (() => Promise<TData>)
  ```
* `isReactHook: true`
  ```ts
  type MyFetcher<TData, TVariables> = (operation: string): ((variables?: TVariables) => Promise<TData>)
  ```

#### Usage example (`isReactHook: false`)
```tsx
export const fetchData = <TData, TVariables>(query: string, variables?: TVariables): (() => Promise<TData>) => {
  return async () => {
    const res = await fetch('https://api.url', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    const json = await res.json();

    if (json.errors) {
      const { message } = json.errors[0] || 'Error..';
      throw new Error(message);
    }

    return json.data;
  };
};
```

#### Usage example (`isReactHook: true`)
```tsx
export const useFetchData = <TData, TVariables>(query: string): (() => Promise<TData>) => {
  // it is safe to call React Hooks here.
  const {url, headers} = React.useContext(FetchParamsContext);
  return async (variables?: TVariables) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    const json = await res.json();

    if (json.errors) {
      const { message } = json.errors[0] || 'Error..';
      throw new Error(message);
    }

    return json.data;
  };
};
```

> Note: The return value is an async function, with no params, that returns a `Promise` with the actual data.
