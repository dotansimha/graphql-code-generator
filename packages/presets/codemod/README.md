# `@graphql-codegen/client-preset-codemod`

When using
[`@graphql-codegen/client-preset`](https://the-guild.dev/graphql/codegen/plugins/presets/preset-client)
on large scale projects, you may want to enable code splitting or tree shaking on the
`client-preset` generated files. This is because instead of using the map which contains all GraphQL
operations in the project, bundlers can use the specific generated document types directly.

`client-preset` ships two build-time plugins that do this by rewriting
`graphql(\`...\`)` call sites into direct imports on every build: a Babel plugin (`babelOptimizerPlugin`, exported from `@graphql-codegen/client-preset`) and `@graphql-codegen/client-preset-swc-plugin`
(a native SWC/Rust plugin). Both require wiring a plugin into your bundler and re-running the same
transform on every single build.

This package performs the **same rewrite once**, as a codemod you run from the command line (or
programmatically) whenever you want, so your bundler doesn't need a Babel or SWC plugin for this at
all — the rewritten imports are just checked into your source control like any other change.

### Before

```ts
import { graphql } from './gql'

const query = graphql(/* GraphQL */ `
  query MyQuery {
    myField
  }
`)
```

### After

```ts
import { MyQueryDocument } from './gql/graphql'

const query = MyQueryDocument
```

## Installation

```bash
pnpm add -D @graphql-codegen/client-preset-codemod
```

## Usage

### CLI

```bash
client-preset-codemod --include "src/**/*.{ts,tsx}" --artifactDirectory ./src/gql
```

| Option                      | Description                                                                                                                          |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `--include <glob>`          | Glob of files to codemod. Repeatable. Prefix a pattern with `!` to exclude it, same as the `documents` field in your codegen config. |
| `--artifactDirectory <dir>` | Directory `client-preset` writes its artifacts to — the same value as the `generates` key using `preset: 'client'`.                  |
| `--gqlTagName <name>`       | Name of the "graphql tag" function to look for. Default: `graphql`.                                                                  |
| `--cwd <dir>`               | Working directory used to resolve globs and paths. Default: current working directory.                                               |
| `--dry-run`                 | Compute the changes without writing them to disk.                                                                                    |

Re-run it any time new `graphql(...)` call sites are added — it's a no-op on files it already
codemodded.

### Programmatic API

```ts
import { runClientPresetCodemod } from '@graphql-codegen/client-preset-codemod'

const { changedFiles, skippedCallSites } = runClientPresetCodemod({
  include: ['src/**/*.{ts,tsx}', '!src/gql/**'],
  artifactDirectory: './src/gql'
})
```

`skippedCallSites` lists call sites the codemod recognized but intentionally left untouched (for
example an anonymous operation, or a template literal that failed to parse as GraphQL), along with
why, so you can review and handle them by hand.

## Limitations

- Only plain, non-interpolated template literals are rewritten
  (`graphql(\`...\`)`). This matches how `client-preset` documents are always written — fragments are referenced by name (`...MyFragment`) rather than interpolated as `${MyFragment}`
  — so this should never exclude a real call site.
- Anonymous operations/fragments are skipped, since there's no generated name to import.
