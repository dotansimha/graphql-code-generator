# GraphQL Code Generator

[![npm version](https://badge.fury.io/js/graphql-code-generator.svg)](https://badge.fury.io/js/graphql-code-generator)
[![Build Status](https://travis-ci.org/dotansimha/graphql-code-generator.svg?branch=master)](https://travis-ci.org/dotansimha/graphql-code-generator)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![renovate-app badge][renovate-badge]][renovate-app]

[renovate-badge]: https://img.shields.io/badge/renovate-app-blue.svg
[renovate-app]: https://renovateapp.com/

<p align="center">
    <img src="https://github.com/dotansimha/graphql-code-generator/blob/master/logo.png?raw=true" />
</p>

## Overview

**[GraphQL Code Generator v0.11 — Generate React and Angular Apollo Components, Resolver signatures and much more!](https://medium.com/the-guild/graphql-code-generator-v0-11-15bb9b02899e)**

**[What’s new in graphql-code-generator 0.9.0? @ Medium](https://medium.com/@dotansimha/whats-new-in-graphql-code-generator-0-9-0-dba6c9e365d)**

**[GraphQL Codegen blog post & examples @ Medium](https://medium.com/@dotansimha/graphql-code-generator-a34e3785e6fb)**

GraphQL code generator, with flexible support for multiple languages and platforms, and the ability to create custom generated projects based on GraphQL schema or operations.

GraphQL entities are defined as static and typed, which means they can be analyzed and use as a base for generating everything.

This generator generates both models (based on GraphQL server-side schema), and documents (client-side operations, such as `query`, `mutation` as `subscription`).

## Use Cases

The codegen let's you either use a predefined template, or write your own.

The predefined templates are common templates that helps GraphQL developers.

For example, if you develop a **server-side with TypeScript and GraphQL**, you can use the codegen with the TypeScript template to generate Typings for you server side, based on your schema.

If you develop a **client-side with TypeScript, Angular and GraphQL**, you can use the codegen with the TypeScript template to generate Typings for you client-side, based on your schema and your queries/mutations.

## Available Templates:

| Language                  | Purpose                                                        | Package Name & Docs                                                                                |
| ------------------------- | -------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| TypeScript                | Generate server-side TypeScript types, and client-side typings | [`graphql-codegen-typescript-template`](./packages/templates/typescript)                           |
| MongoDB TypeScript Models | Generate server-side TypeScript types, with MongoDB models     | [`graphql-codegen-typescript-mongodb-template`](./packages/templates/typescript-mongodb)           |
| Apollo Angular            | Generate TypeScript types, and Apollo Angular Services         | [`graphql-codegen-apollo-angular-template`](./packages/templates/apollo-angular)                   |
| React Apollo Typescript   | Generate TypeScript types, and React Apollo Components         | [`graphql-codegen-typescript-react-apollo-template`](./packages/templates/typescript-react-apollo) |
| XSD                       | Generate XSD file                                              | [`graphql-xsd`](https://www.npmjs.com/package/graphql-xsd)                                         |
| Introspection             | Generate Introspection file                                    | [`graphql-codegen-introspection-template`](./packages/templates/introspection)                     |

If you are looking for the **Flow** / **Swift** generators, please note that we will implement it soon again, but you can use `0.5.5` from NPM.

**Note: In order to use GraphQL `directives` feature, please use GraphQL > 0.9.4 as peer dependency for the generator!**

## Installation

To install the generator, use the following:

    $ npm install --save-dev graphql-code-generator graphql
    // Or, with Yarn
    $ yarn add -D graphql-code-generator graphql

Then, install the template package you wish to use, for example:

    $ npm install --save-dev graphql-codegen-typescript-template
    // Or, with Yarn
    $ yarn add -D graphql-codegen-typescript-template

And then to use it, execute it from NPM script, or use `$(npm bin)/gql-gen ...` from the command line. If you are using Yarn, you can just use `yarn gql-gen ...`

> You can also install it as global NPM module and use it with `gql-gen` executable.

## Usage Examples

This package offers both modules exports (to use with NodeJS/JavaScript application), or CLI util.

CLI usage is as follow:

    $ gql-gen [options] [documents ...]

- With local introspection JSON file, generate TypeScript types:

        $ gql-gen --schema mySchema.json --template graphql-codegen-typescript-template --out ./typings/ "./src/**/*.graphql"

- With local introspection JSON file, generate TypeScript files, from GraphQL documents inside code files (`.ts`):

        $ gql-gen --schema mySchema.json --template graphql-codegen-typescript-template --out ./typings/ "./src/**/*.ts"

- With remote GraphQL endpoint that requires Authorization, generate TypeScript types:

        $ gql-gen --schema http://localhost:3010/graphql --header "Authorization: MY_KEY" --template graphql-codegen-typescript-template --out ./typings/ "./src/**/*.graphql"

> Note: when specifying a glob path (with `*` or `**`), make sure to wrap the argument with double quotes (`"..."`).

### CLI Options

Allowed flags:

| Flag Name           | Type     | Description                                                                                                                                                                                                                                                                              |
| ------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| -s,--schema         | String   | Local or remote path to GraphQL schema: Introspection JSON file, GraphQL server endpoint to fetch the introspection from, local file that exports `GraphQLSchema`, JSON object or AST string, or a Glob expression for `.graphql` files (`"./src/**/*.graphql"`)                         |
| -r,--require        | String   | Path to a `require` extension, [read this](https://gist.github.com/jamestalmage/df922691475cff66c7e6) for more info                                                                                                                                                                      |
| -h,--header         | String   | Header to add to the introspection HTTP request when using remote endpoint                                                                                                                                                                                                               |
| -t,--template       | String   | Template name, for example: "typescript" (not required when using `--project`)                                                                                                                                                                                                           |
| -p,--project        | String   | Project directory with templates (refer to "Custom Templates" section)                                                                                                                                                                                                                   |
| --config            | String   | Path to project config JSON file (refer to "Custom Templates" section), defaults to `gqlgen.json`                                                                                                                                                                                        |
| -o,--out            | String   | Path for output file/directory. When using single-file generator specify filename, and when using multiple-files generator specify a directory                                                                                                                                           |
| -m,--skip-schema    | void     | If specified, server side schema won't be generated through the template (enums won't omit)                                                                                                                                                                                              |
| -c,--skip-documents | void     | If specified, client side documents won't be generated through the template                                                                                                                                                                                                              |
| --no-overwrite      | void     | If specified, the generator will not override existing files                                                                                                                                                                                                                             |
| -w --watch          | boolean  | Enables watch mode for regenerating documents from schema                                                                                                                                                                                                                                |
| documents...        | [String] | Space separated paths of `.graphql` files or code files (glob path is supported) that contains GraphQL documents inside strings, or with either `gql` or `graphql` tag (JavaScript), this field is optional - if no documents specified, only server side schema types will be generated |

## Output Examples

This repository includes some examples for generated outputs under `dev-test` directory.

- Star Wars generated TypeScript output is [available here](./dev-test/star-wars/types.d.ts).
- Star Wars generated TypeScript (multiple files) output is [available here](./dev-test/star-wars/ts-multiple/).
- GitHunt generated TypeScript output is [available here](./dev-test/githunt/types.d.ts).

## Integrate with your project

To use inside an existing project, I recommend to add a pre-build script that executes the code generator, inside you `package.json`, for example:

```json
{
  "name": "my-project",
  "scripts": {
    "prebuild": "gql-gen ...",
    "build": "..."
  }
}
```

## Generator-specific config

Some of the generators supports a custom config, which you can specify using `gqlgen.json` like that:

```json
{
  "generatorConfig": {
    "printTime": true
  }
}
```

Or, you can set the value using environment variables, before executing the codegen, with the `CODEGEN_` prefix:

```
CODEGEN_PRINT_TIME=true gql-gen --template ...
```

## Programmatic Usage

If you with to use this package as a library and execute it from your code, do the following:

```typescript
import { generate } from 'graphql-code-generator';

function doSomething() {
  const generatedFiles = await generate({
    template: 'typescript',
    url: 'http://127.0.0.1:3000/graphql',
    out: process.cwd() + '/models/'
  });
}
```

The method `generate` accepts two parameters: `(options: CLIOptions, saveToFile: boolean)`, and returns `Promise<FileOutput[]>`.

## Custom Templates

To create custom template, or generate a whole project from GraphQL schema, refer to [Custom Templates Documentation](./packages/templates/README.md)

## Watch mode

The watch mode is enabled by passing `--watch` option.
To use the watch mode you need to have Watchman installed in your system. To support glob patterns, version 3.7 and above is required.

## Prettier Support

The generator will automatically executes `prettier` on the output code, when possible. It will automatically use the correct parser according to the file extensions of the output file.
In case of an error, prettier will be ignored, and will write the file as-is.

If you project has [prettier config file](https://prettier.io/docs/en/configuration.html), the generator will use it and respect your code-style.

## TypeScript Support

If you are using TypeScript and would like to use your GraphQL Schema from a local file (using `--schema`), you can use `--require` to load a require extension.

For example, install `ts-node` from NPM and use it this way:

```
gql-gen --require ts-node/register --template typescript --schema ./src/my-schema.ts --out ./src/models/
```

This way, the file `./src/my-schema.ts` is loaded directly as TypeScript file, and you don't need to compile it to plain JavaScript before using it.

## Other Environments

If you are using GraphQL with environment different from NodeJS and wish to generate types and interfaces for your platform, start by installing NodeJS and the package as global, and then add the generation command to your build process.

## Difference with `apollo-codegen`

`apollo-codegen` generates a similar results, but it based on code that generates the results.
This package uses templates (with Handlebars) to generate results, and it basically supports any output because you can simply create you template and then compile it with your GraphQL schema and GraphQL operations and get a more customized result.
This package also allow you to create custom templates, regardless the built-in generators, so you can use your schema as source to any generated result you need.

## Troubleshoot

If you have issues with the generator, feel free open issues in this repository.

If you report a bug or execution issue, please run the generator with `DEBUG=true gql-gel ...` and provide the debug log.

## Contributing

Feel free to open issues (for bugs/questions) and create pull requests (add generators / fix bugs).

## License

[![GitHub license](https://img.shields.io/badge/license-MIT-lightgrey.svg?maxAge=2592000)](https://raw.githubusercontent.com/apollostack/apollo-ios/master/LICENSE)

MIT
