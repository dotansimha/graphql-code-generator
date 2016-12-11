# GraphQL Code Generator

[![GitHub license](https://img.shields.io/badge/license-MIT-lightgrey.svg?maxAge=2592000)](https://raw.githubusercontent.com/apollostack/apollo-ios/master/LICENSE) [![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

## Overview

GraphQL code generator, with flexible support for multiple languages and platforms. 

Supported language/platforms:

- TypeScript (for both client and server)

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

### CLI flags

// TODO

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