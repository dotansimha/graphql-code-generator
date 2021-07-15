---
id: gql-tag
title: gql-tag
---

This preset generates typings for your inline `gql` function usages, without having to manually specify import statements for the documents. All you need to do is import your `gql` function and run codegen in watch mode.

Huge thanks to [Maël Nison](https://github.com/arcanis), who conceptualized the foundation for this preset [over here](https://github.com/arcanis/graphql-typescript-integration).

```ts
import { gql } from '@app/gql';

// TweetFragment is a fully typed document node
const TweetFragment = gql(/* GraphQL */ `
  fragment TweetFragment on Tweet {
    id
    body
  }
`);

const TweetsQueryWithFragment = gql(/* GraphQL */ `
  query TweetsWithFragmentQuery {
    Tweets {
      id
      ...TweetFragment
    }
  }
`);
```

{@import ../generated-config/gql-tag-preset.md}

## Getting Started

In order to use this preset, you need to add the following configuration to your `codegen.yml`:

```yml
schema: src/path/to/your/schema.graphql
documents:
  - 'src/**/*.ts'
  - '!src/gql/**/*'
generates:
  ./src/gql/:
    preset: gql-tag-preset
    plugins:
      - gql-tag
```

It is also recommended, that you link `./src/gql` to `@app/gql`, so you can import your gql function easily from anywhere within your app.

```bash
yarn add -D @app/gql@link:./src/gql
```

Now start your codegen in watch mode via `yarn graphql-codegen --watch`.

Create a new file within your `src` directory, e.g. `./src/index.ts` and add a query for your schema:

```ts
import { gql } from '@app/gql';

// TweetsQuery is a fully typed document node/
const TweetsQuery = gql(/* GraphQL */ `
  query TweetsQuery {
    Tweets {
      id
    }
  }
`);
```

Next we can simply add our GraphQL client of choice and use the typed document! Let's try urql!

```tsx
import { gql } from '@app/gql';
import { useQuery } from 'urql';

// TweetsQuery is a fully typed document node/
const TweetsQuery = gql(/* GraphQL */ `
  query TweetsQuery {
    Tweets {
      id
      body
    }
  }
`);

const Tweets = () => {
  const [result] = useQuery(TweetsQuery);
  const { data, fetching, error } = result;

  if (fetching) return <p>Loading...</p>;
  if (error) return <p>Oh no... {error.message}</p>;

  return (
    <ul>
      {/* data is fully typed 🎉 */}
      {data.Tweets.map(tweet => (
        <li key={tweet.id}>{tweet.body}</li>
      ))}
    </ul>
  );
};
```
