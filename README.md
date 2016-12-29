# GraphQL Code Generator

[![npm version](https://badge.fury.io/js/graphql-code-generator.svg)](https://badge.fury.io/js/graphql-code-generator) [![Build Status](https://travis-ci.org/dotansimha/graphql-code-generator.svg?branch=master)](https://travis-ci.org/dotansimha/graphql-code-generator) [![bitHound Overall Score](https://www.bithound.io/github/dotansimha/graphql-code-generator/badges/score.svg)](https://www.bithound.io/github/dotansimha/graphql-code-generator) [![codebeat badge](https://codebeat.co/badges/ec220cc6-31f0-4a80-85cc-0dfa162d8e53)](https://codebeat.co/projects/github-com-dotansimha-graphql-code-generator) [![bitHound Dependencies](https://www.bithound.io/github/dotansimha/graphql-code-generator/badges/dependencies.svg)](https://www.bithound.io/github/dotansimha/graphql-code-generator/master/dependencies/npm) [![bitHound Dev Dependencies](https://www.bithound.io/github/dotansimha/graphql-code-generator/badges/devDependencies.svg)](https://www.bithound.io/github/dotansimha/graphql-code-generator/master/dependencies/npm) [![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/) 

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
| Swift (with Apollo) | Single File | swift, swift-apollo, swift-single                                                     |

## Examples

Refer to the generated examples inside this repository:

### Star Wars

Based on the GraphQL Star Wars example:
* [Swift Example](https://github.com/dotansimha/graphql-code-generator/blob/master/dev-test/star-wars/API.swift)
* [TypeScript Example](https://github.com/dotansimha/graphql-code-generator/blob/master/dev-test/star-wars/typings.d.ts)

### GitHunt

Based on the Apollo's GitHunt example:
* [Swift Example](https://github.com/dotansimha/graphql-code-generator/blob/master/dev-test/githunt/API.swift)
* [TypeScript Example](https://github.com/dotansimha/graphql-code-generator/blob/master/dev-test/githunt/typings.d.ts)

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

| Flag Name          | Type     | Description                                                                            |
|--------------------|----------|----------------------------------------------------------------------------------------|
| -f,--file          | String   | Introspection JSON file, must provide file or URL flag                                 |
| -u,--url           | String   | GraphQL server endpoint to fetch the introspection from, must provide URL or file flag |
| -e,--export        | String   | Path to a JavaScript (es5/6) file that exports (as default export) your `GraphQLSchema` object |
| -h,--header        | String   | Header to add to the introspection HTTP request when using --url  |
| -t,--template      | String   | Template name, for example: "typescript"                                               |
| -o,--out           | String   | Path for output file/directory. When using single-file generator specify filename, and when using multiple-files generator specify a directory                                     |
| -m,--no-schema     | void     | If specified, server side schema won't be generated through the template (enums won't omit) |
| -c,--no-documents  | void     | If specified, client side documents won't be generated through the template |
| -d,--dev           | void     | Turns ON development mode - prints output to console instead of files                  |
| documents...       | [String] | Space separated paths of `.graphql` files or code files (glob path is supported) that contains GraphQL documents inside strings, or with `gql` tag (JavaScript), this field is optional - if no documents specified, only server side schema types will be generated                           |

**Usage examples:***

- With local introspection JSON file, generate TypeScript types:

        $ gql-gen --file mySchema.json --template typescript --out ./typings/ ./src/**/*.graphql
    
- With local introspection JSON file, generate TypeScript files, from GraphQL documents inside code files (`.ts`):

        $ gql-gen --file mySchema.json --template typescript --out ./typings/ ./src/**/*.ts
    
- With remote GraphQL endpoint, generate Flow types:

        $ gql-gen --url http://localhost:3010/graphql --template flow --out ./typings/ ./src/**/*.graphql

- With remote GraphQL endpoint that requires Authorization, generate TypeScript types:

        $ gql-gen --url http://localhost:3010/graphql --header "Authorization: MY_KEY" --template typescript --out ./typings/ ./src/**/*.graphql
    
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

#### Write a script to generate schema on compilation time

You can import the library, and then write your own script to generate schema typings.
For example:

```typescript
import { graphql, introspectionQuery } from 'graphql';
import { FileResult, Transform, TransformedOptions, getTemplateGenerator } from 'graphql-code-generator';
import * as fs from 'fs';

import { schema } from './schema';
// schema is GraphQLScheme Object.

const OUT = "./graphql-types.d.ts";

Promise.all([
  graphql(schema, introspectionQuery).then(res => res.data),
  getTemplateGenerator('typescript'),
]).then(([introspection, template]) => (<TransformedOptions>{
  introspection: introspection,
  documents: [],
  template: template,
  outPath: OUT,
  isDev: false,
  noSchema: false,
  noDocuments: true,
}))
.then(Transform)
.then((files: FileResult[]) => {
  files.forEach((fileResult: FileResult) => {
    fs.writeFileSync(fileResult.path, fileResult.content);
  });
  return files;
});
```

#### Other Environments

If you are using GraphQL with environment different from NodeJS and wish to generate types and interfaces for your platform, start by installing NodeJS and the package as global, and then add the generation command to your build process.

## Contributing

Feel free to open issues (for bugs) and create pull requests (add generators / fix bugs).

## License

[![GitHub license](https://img.shields.io/badge/license-MIT-lightgrey.svg?maxAge=2592000)](https://raw.githubusercontent.com/apollostack/apollo-ios/master/LICENSE)

MIT
