---
id: typescript-server
title: TypeScript Server
---

A plugin that should be loaded if generating typescript code that should be relevant for server. Must be loaded with [`typescript-common`](./typescript-common).

### Installation

Install using `npm` (or `yarn`):

    $ npm install graphql-codegen-typescript-server

### Configuration

#### `schemaNamespace`

Specify this configuration field to wrap your entire types with a specific TypeScript `namespace`.
