---
id: gql-tag-operations
---

This preset generates typings for your inline `gql` function usages, without having to manually specify import statements for the documents. All you need to do is import your `gql` function and run codegen in watch mode.

Huge thanks to [Maël Nison](https://github.com/arcanis), who conceptualized the foundation for this preset [over here](https://github.com/arcanis/graphql-typescript-integration).

```ts
import { gql } from '@app/gql'

// TweetFragment is a fully typed document node
const TweetFragment = gql(/* GraphQL */ `
  fragment TweetFragment on Tweet {
    id
    body
  }
`)

const TweetsQueryWithFragment = gql(/* GraphQL */ `
  query TweetsWithFragmentQuery {
    Tweets {
      id
      ...TweetFragment
    }
  }
`)
```

## Getting Started

In order to use this preset, you need to add the following configuration to your `codegen.yml`:

```yml
schema: src/path/to/your/schema.graphql
documents:
  - 'src/**/*.ts'
  - '!src/gql/**/*'
generates:
  ./src/gql/:
    preset: gql-tag-operations-preset
```

It is also recommended, that you link `./src/gql` to `@app/gql`, so you can import your gql function easily from anywhere within your app.

```bash
yarn add -D @app/gql@link:./src/gql
```

Now start your codegen in watch mode via `yarn graphql-codegen --watch`.

Create a new file within your `src` directory, e.g. `./src/index.ts` and add a query for your schema:

```ts
import { gql } from '@app/gql'

// TweetsQuery is a fully typed document node!
const TweetsQuery = gql(/* GraphQL */ `
  query TweetsQuery {
    Tweets {
      id
    }
  }
`)
```

Next we can simply add our GraphQL client of choice and use the typed document! Let's try urql!

```tsx
import { gql } from '@app/gql'
import { useQuery } from 'urql'

// TweetsQuery is a fully typed document node/
const TweetsQuery = gql(/* GraphQL */ `
  query TweetsQuery {
    Tweets {
      id
      body
    }
  }
`)

const Tweets = () => {
  const [result] = useQuery({ query: TweetsQuery })
  const { data, fetching, error } = result

  if (fetching) return <p>Loading...</p>
  if (error) return <p>Oh no... {error.message}</p>

  return (
    <ul>
      {/* data is fully typed 🎉 */}
      {data.Tweets.map(tweet => (
        <li key={tweet.id}>{tweet.body}</li>
      ))}
    </ul>
  )
}
```

If we want to use fragments, we can use some utilities for accessing the fragment types:

```tsx
import { gql, DocumentType } from '../gql'

const TweetFragment = gql(/* GraphQL */ `
  fragment TweetFragment on Tweet {
    id
    body
  }
`)

const Tweet = (props: {
  /** tweet property has the correct type 🎉 */
  tweet: DocumentType<typeof TweetFragment>
}) => {
  return <li data-id={props.id}>{props.body}</li>
}

const TweetsQuery = gql(/* GraphQL */ `
  query TweetsQuery {
    Tweets {
      id
      ...TweetFragment
    }
  }
`)

const Tweets = () => {
  const [result] = useQuery({ query: TweetsQuery })
  const { data, fetching, error } = result

  if (fetching) return <p>Loading...</p>
  if (error) return <p>Oh no... {error.message}</p>

  return (
    <ul>
      {data.Tweets.map(tweet => (
        <Tweet key={tweet.id} tweet={tweet} />
      ))}
    </ul>
  )
}
```

You can find a [full `gql-tag-operations` example of this in the GraphQL Code Generator GitHub repository](https://github.com/dotansimha/graphql-code-generator/tree/master/dev-test/gql-tag-operations).

## Improving bundle-size with the gql-tag-operations babel plugin

Because the generated code output is a single `gql` function that looks similar to the following code, code-splitting and tree-shaking is not easily possible.

```ts
import * as graphql from './graphql'

const documents = {
  '\n  query Foo {\n    Tweets {\n      id\n    }\n  }\n': graphql.FooDocument,
  '\n  fragment Lel on Tweet {\n    id\n    body\n  }\n': graphql.LelFragmentDoc,
  '\n  query Bar {\n    Tweets {\n      ...Lel\n    }\n  }\n': graphql.BarDocument
}

export function gql(
  source: '\n  query Foo {\n    Tweets {\n      id\n    }\n  }\n'
): typeof documents['\n  query Foo {\n    Tweets {\n      id\n    }\n  }\n']
export function gql(
  source: '\n  fragment Lel on Tweet {\n    id\n    body\n  }\n'
): typeof documents['\n  fragment Lel on Tweet {\n    id\n    body\n  }\n']
export function gql(
  source: '\n  query Bar {\n    Tweets {\n      ...Lel\n    }\n  }\n'
): typeof documents['\n  query Bar {\n    Tweets {\n      ...Lel\n    }\n  }\n']

export function gql(source: string): unknown
export function gql(source: string) {
  // OH NO gql accesses the documents object, the bundler cannot make assumption over what is actually used at runtime :(
  return (documents as any)[source] ?? {}
}
```

However, the `@graphql-codegen/gql-tag-operations-preset` package ships with a babel plugin for rewriting the `gql` usages to actual imports.

This is the code that you write:

```tsx
import { gql, DocumentType } from '../gql'

const TweetFragment = gql(/* GraphQL */ `
  fragment TweetFragment on Tweet {
    id
    body
  }
`)
```

This is the code after the babel transformation:

```ts
import { TweetFragmentDoc } from \\"./graphql\\";

const TweetFragment = TweetFragmentDoc
```

This will result in much smaller bundles when you code-split parts of your code.

Applying the babel plugin is straight-forward:

**.babelrc.mjs**

```ts
import { babelPlugin } from '@graphql-codegen/gql-tag-operations-preset'
export default {
  plugins: [
    // your other plugins such as typescript syntax stripping etc.

    // make sure the artifactDirectory is the same as your generates path within the codegen.yml
    [babelPlugin, { artifactDirectory: './src/gql' }]
  ]
}
```

Afterwards, you won't have to worry about bundle size anymore!

## Using module augmentation for an existing `gql` function from a library

Sometimes the library you are using, let's use `urql` for this example, already exposes a `gql` function and instead of generating a new one you would prefer to just generate types that extend the type-definitions of that `gql` function.

This can be easily achieved by running the `gql-tag-operations` plugin in module augmentation mode!

**codegen.yml**

```yml
schema: src/path/to/your/schema.graphql
documents:
  - 'src/**/*.ts'
  - '!src/gql/**/*'
generates:
  src/gql/:
    preset: gql-tag-operations-preset
    presetConfig:
      # define which module you want to import your gql function from
      augmentedModuleName: '@urql/core'
```

When the `augmentedModuleName` option is configured instead of the `./src/gql/index.ts` file a `./src/gql/index.d.ts` file is generated.

```ts
/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core'

declare module '@urql/core' {
  export function gql(
    source: '\n  query Bar {\n    Tweets {\n      ...Lel\n    }\n  }\n'
  ): typeof import('./graphql').BarDocument
  export function gql(source: string): unknown
}
```

Now you can simply use your `gql` function imported from `@url/core` in your application code for having fully typed document nodes.

```ts
import { gql } from 'urql'

const FooQuery = gql(/* GraphQL */ `
  query Foo {
    Tweets {
      id
    }
  }
`)
```

**NOTE**: In case you are using fragments you **MUST** use the gql-tag-operations babel plugin as otherwise the `gql` calls that reference global fragments will cause runtime errors, as the `gql` operation cannot find the global fragment. Unfortunately, it is also **NOT** possible to embed fragments with template string interpolation, as it breaks TypeScript type-inference.

```ts
import { gql } from 'urql'

// This causes an error without the babel plugin
const FooQuery = gql(/* GraphQL */ `
  query Foo {
    Tweets {
      ...SomeTweetFragment
    }
  }
`)
```

You can find a [full `gql-tag-operations-urql` example of this in the GraphQL Code Generator GitHub repository](https://github.com/dotansimha/graphql-code-generator/tree/master/dev-test/gql-tag-operations-urql).

{@apiDocs}
