# GraphQL Code Generator

[![npm version](http://d25lcipzij17d.cloudfront.net/badge.svg?id=js&type=6&v=0.1.8&x2=0)](https://badge.fury.io/js/graphql-code-generator) [![Build Status](https://travis-ci.org/dotansimha/graphql-code-generator.svg?branch=master)](https://travis-ci.org/dotansimha/graphql-code-generator) [![codecov](https://codecov.io/gh/dotansimha/graphql-code-generator/branch/master/graph/badge.svg)](https://codecov.io/gh/dotansimha/graphql-code-generator) [![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/) [![GitHub license](https://img.shields.io/badge/license-MIT-lightgrey.svg?maxAge=2592000)](https://raw.githubusercontent.com/apollostack/apollo-ios/master/LICENSE)


## Overview

GraphQL code generator, with flexible support for multiple languages and platforms. 

This generator generates both models (based on GraphQL server-side schema), and documents (client-side operations, such as Query, Mutation as Subscription).

Most of the generators support single-file (which is a large file with all of your types/classes/interfaces/enums), and some support multiple-files (file for each model/document, with support for imports).

**Supported languages/platforms:**

| Language        | Type           | CLI Name                                                                  |
|-----------------|----------------|---------------------------------------------------------------------------|
| TypeScript      | Single File    | ts, typescript, ts-single, typescript-single                              |
| TypeScript      | Multiple Files | ts-multiple, typescript-multiple                                          |
| Flow            | Single File    | flow, flow-single                                                         |


## Installation

#### Global

To install the package using NPM, run:

    $ npm install -g graphql-code-generator

Or, using Yarn:
    
    $ yarn global add graphql-code-generator

#### Dev-dependency

You can also add it as dev-dependency to your application:

    $ npm install --save-dev graphql-code-generator

Or, using Yarn:
    
    $ yarn add --dev graphql-code-generator

## Usage

This package offers both modules exports (to use with NodeJS/JavaScript application), or CLI util.

### CLI 

CLI usage is as follow:

    $ gql-gen [options] [documents ...]
    
Allowed flags:    

| Flag Name       | Type     | Description                                                                            |
|-----------------|----------|----------------------------------------------------------------------------------------|
| -f,--file       | String   | Introspection JSON file, must provide file or URL flag                                 |
| -u,--url        | String   | GraphQL server endpoint to fetch the introspection from, must provide URL or file flag |
| -t,--template   | String   | Template name, for example: "typescript"                                               |
| -o,--out        | String   | Path for output file/directory. When using single-file generator specify filename, and when using multiple-files generator specify a directory                                     |
| -d,--dev        | void     | Turns ON development mode - prints output to console instead of files                  |
| documents...    | [String] | Space separated paths of `.graphql` files, allows glob path, this field is optional - if no documents specified, only server side schema types will be generated                           |

Usage examples:

- With local introspection JSON file, generated TypeScript types:

        $ gql-gen --file mySchema.json --template typescript --out ./typings/ ./src/**/*.graphql
    
   
- With remote GraphQL endpoint, generated TypeScript types:

        $ gql-gen --url http://localhost:3010/graphql --template typescript --out ./typings/ ./src/**/*.graphql
    

- Example using pre-defined files inside this repo (using Apollo's [GitHunt-API](https://github.com/apollostack/Githunt-API) and [GitHunt-Angular2](https://github.com/apollostack/Githunt-angular2)):

        $ gql-gen --file ./dev-test/githunt/schema.json --template typescript --out ./dev-test/githunt/typings.d.ts ./dev-test/githunt/**/*.graphql 

## Integrate into a project

To use inside an existing project, I recommend to add a pre-build script that executes the code generator.

#### JavaScript / NodeJS

When using NodeJS/JavaScript application, use NPM script to generate your types, using the command line flags that suits you best

`package.json`:

    // ...
    "scripts": {
        "prebuild": "gql-gen --file SCHEMA_FILE --template LANGUAGE_TEMPLATE --out OUT_PATH ./src/**/*.graphql"
        "build": "YOUR_BUILD_SCRIPT_HERE"
    },
    // ...

#### Other Environments

If you are using GraphQL with environment different from NodeJS and wish to generate types and interfaces for your platform, start by installing NodeJS and the package as global, and then add the generation command to your build process.

## Contributing

Feel free to open issues (for bugs) and create pull requests (add generators / fix bugs).

## License

MIT
