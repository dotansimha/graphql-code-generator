# GraphQL Code Generator

[![GitHub license](https://img.shields.io/badge/license-MIT-lightgrey.svg?maxAge=2592000)](https://raw.githubusercontent.com/apollostack/apollo-ios/master/LICENSE) [![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

## Overview

GraphQL code generator, with flexible support for multiple languages and platforms. 

Supported language/platforms:

| Language        | Type           | CLI Name                                                                  |
|-----------------|----------------|---------------------------------------------------------------------------|
| TypeScript      | Single File    | ts, typescript, ts-single, typescript-single                              |
| TypeScript      | Multiple Files | ts-multiple, typescript-multiple                                          |


## Installation

#### Global

To install the package using NPM, run:

    $ npm install -g graphql-codegen

Or, using Yarn:
    
    $ yarn global add graphql-codegen

#### Dev-dependency

You can also add it as dev-dependency to your application:

    $ npm install --save-dev graphql-codegen

Or, using Yarn:
    
    $ yarn add --dev graphql-codegen

## Usage

This package offers both modules exports (to use with NodeJS/JavaScript application), or CLI util.

### CLI 

CLI usage is as follow:

    $ graphql-codegen [options] <documents ...>
    
Allowed flags:    

| Flag Name       | Type     | Description                                                                            |
|-----------------|----------|----------------------------------------------------------------------------------------|
| -f, --file      | String   | Introspection JSON file, must provide file or URL flag                                 |
| -u, --url       | String   | GraphQL server endpoint to fetch the introspection from, must provide URL or file flag |
| -t, --template  | String   | Template name, for example: "typescript"                                               |
| -o, --out       | String   | Path for output file/directory. default is `./`                                        |
| documents...    | [String] | Space separated paths of `.graphql` files, allows glob path                            |

Usage examples:

- With local introspection JSON file, generated TypeScript types:

        $ graphql-codegen --file mySchema.json --template typescript --out ./typings/ ./src/**/*.graphql
    
   
- With remote GraphQL endpoint, generated TypeScript types:

        $ graphql-codegen --url http://localhost:3010/graphql --template typescript --out ./typings/ ./src/**/*.graphql
    

- Example using pre-defined files inside this repo (using Apollo's [GitHunt-API](https://github.com/apollostack/Githunt-API) and [GitHunt-Angular2](https://github.com/apollostack/Githunt-angular2)):

        $ graphql-codegen --file ./dev-test/githunt/schema.json --template typescript --out ./dev-test/githunt/typings.d.ts ./dev-test/githunt/**/*.graphql 

## Integrate into a project

To use inside an existing project, I recommend to add a pre-build script that executes the code generator.

#### JavaScript / NodeJS

When using NodeJS/JavaScript application, use NPM script to generate your types, using the command line flags that suits you best

`package.json`:

    // ...
    "scripts": {
        "prebuild": "graphql-codegen --file SCHEMA_FILE --template LANGUAGE_TEMPLATE --out OUT_PATH ./src/**/*.graphql"
        "build": "YOUR_BUILD_SCRIPT_HERE"
    },
    // ...

> We used NPM script that executed before `build` task, and executes `graphql-codegen` in order to generate the types.

## Contributing

Feel free to open issues (for bugs) and create pull requests (add generators / fix bugs).

## License

MIT