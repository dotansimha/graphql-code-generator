---
id: typescript-oclif
title: TypeScript oclif
---

This plugin generates [`oclif`](https://www.npmjs.com/package/oclif) CLI commands.

{@import ../plugins/client-note.md}

## Installation

[You can find a working example of this plugin here](https://github.com/kalzoo/graphql-codegen-oclif-example/)

    yarn add @graphql-codegen/typescript @graphql-codegen/typescript-oclif

The, make sure you have `typescript` plugin as well in your configuration:

```yml
schema: http://localhost:4000
documents: 'src/commands/**/*.graphql'
generates:
  src/types.ts:
    - typescript
  src/commands/:
    preset: near-operation-file
    presetConfig:
      extension: .ts
      baseTypesPath: ../types.ts
    plugins:
      - typescript-oclif:
          handlerPath: ../../handler
```

## Usage

With GraphQL Codegen, building a CLI tool for your GraphQL API couldn't be easier. In four steps,
you can have a user-friendly command-line interface:

1. Generate a boilerplate CLI using `oclif`
2. Add GraphQL Documents (Queries & Mutations)
3. Add and export a graphql client of your choice (`graphql-request`, `apollo-client`, etc)
4. Add, configure, and run the code generator

### Step 1: Generate the CLI scaffold

You'll be starting from your projects directory. From there, generate the CLI skeleton using `oclif`
by following the steps in their [guide](https://oclif.io/docs/introduction). You can choose either
the `single` or `multi` type, and can switch later if you change your mind.

### Step 2: Add GraphQL Documents

These documents are how `oclif` will interact with your API. For each document, there will be
exactly one command.

Within the directory created by the `oclif` tool, you'll have a subdirectory `src/commands`. That's
where you'll put your GraphQL documents. Ie, to create a `<cli-name> hello` command, you'd write a
`src/commands/hello.graphql` document, which will be used to generate a `src/commands/hello.ts`
file. **Important**: each document should have exactly one GraphQL operation.

### Step 3: Add & Export a GraphQL Query Handler

Which client you use, and how you configure it, is entirely up to you! It just has to conform to
this `QueryHandler` signature:

```ts
import { Command } from '@oclif/command';

interface QueryHandlerProps {
  command: Command;
  query: string;
  variables?: Record<string, any>;
}

type QueryHandler = (props: QueryHandlerProps) => any;
```

This allows you to pre-process, send, and post-process requests however you'd like, as well as format
the results returned. The arguments are:

- `command`: the command object being executed, described [here](https://oclif.io/docs/commands)
  in the `oclif` documentation.
- `query`: the string version of the GraphQL query being executed.
- `variables`: the variables as configured in your GraphQL operation and parsed by `oclif`.

You can add a `src/handler.ts` (or any other path), configure your handler function there, and then
export your handler as the **default export**. It's in this module that you can handle auth logic,
read config files, etc., and that will apply to all CLI operations. This file will not be modified
by the codegen.

To get started quickly and easily, consider using the simple `graphql-request` as your handler:

```ts
// handler.ts

import { GraphQLClient } from 'graphql-request';
import { Command } from '@oclif/command';

interface QueryHandlerProps {
  command: Command;
  query: string;
  variables?: Record<string, any>;
}

// Change the URL to the endpoint your CLI will use
const client = new GraphQLClient('http://localhost:4000');

const handler = ({ command, query, variables }: QueryHandlerProps) => {
  return client
    .request(query, variables)
    .then(command.log)
    .catch(command.error);
};

export default handler;
```

### Step 4: Add & Configure GraphQL Codegen

First, follow the GraphQL-Code-Generator guide to install it, and make sure to also install
`@graphql-codegen/typescript-oclif`. Then, change your `codegen.yml` file to look like this:

```
schema: <path-to-your-schema>
documents: "src/commands/**/*.graphql"
generates:
  src/types.ts:
    - typescript
  src/commands/:
    preset: near-operation-file
    presetConfig:
      extension: .ts
      baseTypesPath: ../types.ts
    plugins:
      - typescript-oclif:
          client: ../../client
```

Breaking that down:

- Reading your schema allows the codegen tool to understand what types it's working with
- The 'documents' section will collect all of your `*.graphql` files
- `src/types.ts` creates the typescript types that the rest of the tool can reference
- `near-operation-file` is a `graphql-codegen` preset which allows one output file per input file
  (ie, one `.ts` module per `.graphql` document) rather than one output file for the whole package.
  This is _required_ for `oclif` to work, since it uses the file structure to generate the command structure.
- Note: `typescript-operations` plugin isn't required, since this library isn't meant to be consumed
  programmatically (and so nothing reads the types that `typescript-operations` would produce)
- The `client` path is to the file which has a default export of your `graphql-request` client,
  relative to the generated files (ie here, `src/commands/something/file.graphql`).
  Note that it has no extension.

With that configured, just run `yarn graphql-codegen` or `npx graphql-codegen` to generate all the
necessary `oclif` command files. With that complete, follow the directions in the
[oclif guide](https://oclif.io/docs/introduction) to run your new CLI tool.

## Advanced Features

### Descriptions & Examples

You can add descriptions and examples for your commands via `typescript-oclif` with the `@oclif`
client-side directive, like so:

```
mutation CreateAuthor($name: String!)
  @oclif(description: "Create a new author", example: "cli author:create --name Alice", example: "cli author:create --name Bob") {
  createAuthor(input: { name: $name }) {
    name
  }
}
```

This `@oclif` directive will not be sent to the server. Note that, for multiple examples, you must
use multiple `example` keys rather than an `examples` array. This is a ~~quirk~~ feature of
`graphql`.

### Custom/Manually-maintained Commands

If you want a command that doesn't just execute a GraphQL Query or Mutation, then you can still
create one manually in the same way as any other `oclif` application. If you wanted to add a `fix`
command, for example, you can just create a file at `src/commands/fix.ts`, follow the `oclif` API
(ie, export a class with a `run()` method), and `graphql-codegen` won't disturb that file - so long
as you **don't** _also_ create a `fix.graphql` file next to it (in which case, it _would_ overrride
`fix.ts` on the next run of `graphql-codegen`).
