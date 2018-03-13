# GraphQL Code Generator

[![npm version](https://badge.fury.io/js/graphql-code-generator.svg)](https://badge.fury.io/js/graphql-code-generator) [![Build Status](https://travis-ci.org/dotansimha/graphql-code-generator.svg?branch=master)](https://travis-ci.org/dotansimha/graphql-code-generator) [![bitHound Overall Score](https://www.bithound.io/github/dotansimha/graphql-code-generator/badges/score.svg)](https://www.bithound.io/github/dotansimha/graphql-code-generator) [![codebeat badge](https://codebeat.co/badges/ec220cc6-31f0-4a80-85cc-0dfa162d8e53)](https://codebeat.co/projects/github-com-dotansimha-graphql-code-generator) [![bitHound Dependencies](https://www.bithound.io/github/dotansimha/graphql-code-generator/badges/dependencies.svg)](https://www.bithound.io/github/dotansimha/graphql-code-generator/master/dependencies/npm) [![bitHound Dev Dependencies](https://www.bithound.io/github/dotansimha/graphql-code-generator/badges/devDependencies.svg)](https://www.bithound.io/github/dotansimha/graphql-code-generator/master/dependencies/npm)

<p align="center">
    <img src="https://github.com/dotansimha/graphql-code-generator/blob/master/logo.png?raw=true" />
</p>

## Overview

**[GraphQL Codegen 1.0 blog post & examples @ Medium](https://medium.com/@dotansimha/graphql-code-generator-a34e3785e6fb)**

GraphQL code generator, with flexible support for multiple languages and platforms, and the ability to create custom generated projects based on GraphQL schema or operations.

This generator generates both models (based on GraphQL server-side schema), and documents (client-side operations, such as `query`, `mutation` as `subscription`).

There are 3 types of template generators available at the moment:

* Single file - generates a single output file from GraphQL schema and operations
* Multiple files - generated multiple files (usually file per type/operation/enum...)
* Project - generated multiple/single file, based on custom templates in a directory.

**Supported languages/platforms (`0.8.x`):**

| Language        | Type           | CLI Name                                                                  |
|-----------------|----------------|---------------------------------------------------------------------------|
| TypeScript      | Single File    | ts, typescript, ts-single, typescript-single                              |
| TypeScript      | Multiple Files | ts-multiple, typescript-multiple                                          |

If you are looking for the **Flow** / **Swift** generators, please note that we will implement it soon again, but you can use `0.5.5` from NPM.

**Note: In order to use GraphQL `directives` feature, please use GraphQL > 0.9.4 as peer dependency for the generator!**

## Installation

To install the generator, use the following:

    $ npm install --save-dev graphql-code-generator

Or, using Yarn:

    $ yarn add -D graphql-code-generator

And then to use it, execute if from NPM script, for use `$(npm bin)/gql-gen ...` from the command line.

> You can also install it as global NPM module and use it with `gql-gen` executable.

## Usage Examples

This package offers both modules exports (to use with NodeJS/JavaScript application), or CLI util.

CLI usage is as follow:

    $ gql-gen [options] [documents ...]

- With local introspection JSON file, generate TypeScript types:

        $ gql-gen --file mySchema.json --template typescript --out ./typings/ "./src/**/*.graphql"

- With local introspection JSON file, generate TypeScript files, from GraphQL documents inside code files (`.ts`):

        $ gql-gen --file mySchema.json --template typescript --out ./typings/ "./src/**/*.ts"

- With remote GraphQL endpoint that requires Authorization, generate TypeScript types:

        $ gql-gen --url http://localhost:3010/graphql --header "Authorization: MY_KEY" --template typescript --out ./typings/ "./src/**/*.graphql"

> Note: when specifying a glob path (with `*` or `**`), make sure to wrap the argument with double quotes (`"..."`).

### CLI Options

Allowed flags:

| Flag Name          | Type     | Description                                                                            |
|--------------------|----------|----------------------------------------------------------------------------------------|
| -f,--file          | String   | Introspection JSON file, must provide file or URL flag                                 |
| -u,--url           | String   | GraphQL server endpoint to fetch the introspection from, must provide URL or file flag |
| -e,--export        | String   | Path to a JavaScript (es5/6) file that exports (as default export) your `GraphQLSchema` object |
| -r,--require       | String   | Path to a `require` extension, see TypeScript support for more info |
| -h,--header        | String   | Header to add to the introspection HTTP request when using --url  |
| -t,--template      | String   | Template name, for example: "typescript" (not required when using `--project`)         |
| -p,--project       | String   | Project directory with templates (refer to "Project Generation" section)                |
| --project-config   | String   | Path to project config JSON file (refer to "Project Generation" section), defaults to `gqlgen.json` |
| -o,--out           | String   | Path for output file/directory. When using single-file generator specify filename, and when using multiple-files generator specify a directory                                     |
| -m,--no-schema     | void     | If specified, server side schema won't be generated through the template (enums won't omit) |
| -c,--no-documents  | void     | If specified, client side documents won't be generated through the template |
| --no-overwrite     | void     | If specified, the generator will not override existing files |
| documents...       | [String] | Space separated paths of `.graphql` files or code files (glob path is supported) that contains GraphQL documents inside strings, or with `gql` tag (JavaScript), this field is optional - if no documents specified, only server side schema types will be generated                           |

## Examples

This repository includes some examples for generated outputs under `dev-test` directory.

* Star Wars generated TypeScript output is [available here](https://github.com/dotansimha/graphql-code-generator/blob/master/dev-test/star-wars/types.d.ts).
* Star Wars generated TypeScript (multiple files) output is [available here](https://github.com/dotansimha/graphql-code-generator/blob/master/dev-test/star-wars/ts-multiple/).
* GitHunt generated TypeScript output is [available here](https://github.com/dotansimha/graphql-code-generator/blob/master/dev-test/githunt/types.d.ts).

## Integration

To use inside an existing project, I recommend to add a pre-build script that executes the code generator, inside you `package.json`, for example:

```json
{
    "name": "my-project",
    "scripts": {
        "prebuild": "gql-gen ...",
        "build": "webpack"
    }
}
```

## Custom Templates

To create custom template, or generate a whole project from GraphQL schema, refer to [Custom Templates Documentation](https://github.com/dotansimha/graphql-code-generator/blob/master/packages/graphql-codegen-generators/CUSTOM_TEMPLATES.md)

## Packages

GraphQL code generator implementation is separated to multiple NPM packages:

| Package Name       | Documentation |
|--------------------|---------------|
| `graphql-codegen-core` | [README](https://github.com/dotansimha/graphql-code-generator/blob/master/packages/graphql-codegen-core/README.md) |
| `graphql-codegen-compiler` | [README](https://github.com/dotansimha/graphql-code-generator/blob/master/packages/graphql-codegen-compiler/README.md) |
| `graphql-codegen-generators` | [README](https://github.com/dotansimha/graphql-code-generator/blob/master/packages/graphql-codegen-generators/README.md) |
| `graphql-codegen-cli` | [README](https://github.com/dotansimha/graphql-code-generator/blob/master/packages/graphql-codegen-cli/README.md) |

## TypeScript Support

If you are using TypeScript and would like to use your GraphQL Schema from a local file (using `--export`), you can use `--require` to load a require extension.

For example, install `ts-node` from NPM and use it this way:

```
gql-gen --require ts-node/register --template typescript --export ./src/my-schema.ts --out ./src/models/
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
