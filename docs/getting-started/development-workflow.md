---
id: development-workflow
title: Development Workflow
---

The GraphQL Code Generator should be integrated as part of your development workflow.

### Scripts Integration

If you wish to run the codegen before starting your server/app, you can use `pre` scripts in your `package.json`, for example:

```json
{
  "scripts": {
    "dev": "nodemon app.js",
    "start": "node app.js",
    "generate": "graphql-codegen",
    "prestart": "yarn generate",
    "predev": "yarn generate"
  }
}
```

This way, the codegen will generate the output according to your configuration before each time you run `dev` or `start` scripts.

It's also useful to run the codegen during your continuous integration flow and make sure that you code always compiles with the generated output, this way you can detect breaking changes in your GraphQL schema and GraphQL documents.

### Watch Mode

If you wish to run the codegen in watch mode, you can specify `--watch` when running it.

You can either run it in a separate terminal session, or use tools like [`concurrently`](https://www.npmjs.com/package/concurrently) to run two scripts at the same time:

```json
{
  "scripts": {
    "dev": "concurrently \"nodemon app.js\" \"yarn generate --watch\"",
    "start": "node app.js",
    "generate": "graphql-codegen",
    "prestart": "yarn generate"
  }
}
```

### Monorepo and Yarn Workspaces

If you are using a monorepo structure, with tools such as [Yarn Workspaces](https://yarnpkg.com/lang/en/docs/workspaces/) or [Lerna](https://github.com/lerna/lerna), we recommend to install the codegen in the root of your monorepo.

If you need to execute the codegen multiple times, note that you can specify multiple fields for `generates` field, for example:

```yml
schema: 'server/src/**/*.graphql'
documents: 'client/src/**/*.graphql'
generates:
  client/src/models.ts:
    - typescript
    - typescript-operations
  server/src/models.ts:
    - typescript
    - typescript-resolvers
```
