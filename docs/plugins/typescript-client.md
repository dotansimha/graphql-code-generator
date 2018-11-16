---
id: typescript-client
title: Typescript Client
---

A plugin that should be loaded if generating typescript code that should be relevant for client. Must be loaded with [`typescript-common`](./typescript-common).

### Installation

Install using `npm` (or `yarn`):

    $ npm install graphql-codegen-typescript-client

### Examples

- [Star Wars Schema](https://github.com/dotansimha/graphql-code-generator/blob/master/dev-test/star-wars/types.d.ts#L27)

## Configuration

#### `noNamespaces` (default value: `false`)

This will cause the codegen not to use `namespace` in typings.

This configuration field is useful if you are using [babel-typescript](https://blogs.msdn.microsoft.com/typescript/2018/08/27/typescript-and-babel-7/) or [Create-React-App](https://github.com/facebook/create-react-app), because Babel 7 TypeScript preset does not support `namespace`s.
