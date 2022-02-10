---
id: contributing
title: Contributing
---

When your new plugin is ready, you can either:
- maintain it in your repo and npm package
- contribute and make it part of the GraphQL Code Generator repo

Our repository contains plugins for all languages and platforms.
If your plugin could be helpful for others, please consider creating a PR and maintaining it in our repo.
Doing so will also promise to run your tests against the latest core changes and make sure that no breaking changes affect your plugin.

## 1. Requirements

To be able to clone, build and develop codegen, you'll need to have the following installed:

- [GitHub Account](https://github.com)
- [Git](https://git-scm.com/downloads)
- [NodeJS](https://nodejs.org/en) (v10/v12/v13)
- [Yarn](https://yarnpkg.com) (v1)
- Any code editor (we recommend [VSCode](https://code.visualstudio.com))

GraphQL Code Generator uses the following stack to manage the source code:

1. [TypeScript](https://typescriptlang.org) - for writing the code
2. [Bob](https://github.com/kamilkisiela/bob) - for building, bundling, and development workflow
3. [Jest](https://jestjs.io) - for running tests.

## 2. Fork and Clone

Start by [creating a Fork in GitHub](https://help.github.com/en/github/getting-started-with-github/fork-a-repo); this will allow you to make changes and push them quickly later.

Then, use Git [to clone](https://help.github.com/en/github/creating-cloning-and-archiving-repositories/cloning-a-repository-from-github) your newly created fork repository.

It's also recommended to create a new Git branch at this point, from `master` branch.

## 3. Install Dependencies

GraphQL Code Generator is built as a monorepo, using [Yarn Workspaces](https://classic.yarnpkg.com/en/docs/workspaces/) it means that all scripts and dependencies are located in the root `package.json` of the project.

Now that you have a local copy of the project, start by installing the dependencies for all packages in the repo, by running the following in the root directory of the project:

```sh
yarn
```

> If you make changes, add libraries, or new packages, make sure to install the dependencies again, but always from the root directory, otherwise you'll break the monorepo structure.

## 4. Make sure everything works

To test the initial scripts and verify that you have a valid development environment, start by running the following scripts from the root directory:

```sh
yarn build
yarn test
```

The command above will make sure to build all common/core packages, and will make sure that all tests are passing.

## 5. Add your plugin

To add your plugin, start by creating a directory for it. All existing plugins are located under `packages/plugins/` directory, so add it there.

Now, create a simple `package.json` (or, you can [copy from other plugins](https://github.com/dotansimha/graphql-code-generator/blob/master/packages/plugins/typescript/typescript/package.json)...)

Make sure to follow the following instructions:

1. Make sure the package name starts with `@graphql-codegen/` prefix.

```json
  "name": "@graphql-codegen/MY_PLUGIN_NAME",
```

2. Make sure that the version is aligned with all other existing packages.

```json
  "version": "X.Y.Z",
```

> The current version of the codegen is: ![Codegen version](https://img.shields.io/npm/v/@graphql-codegen/cli?color=%23e15799&label=)

3. Make sure that you have the following `scripts` configured;

```json
  "scripts": {
    "lint": "eslint **/*.ts",
    "test": "jest --no-watchman --config ../../../../jest.config.js",
    "prepack": "bob prepack"
  },
```

> This will make sure that your plugin is compatible with our build and test system.

4. Make sure your basic plugin dependencies are configured this way:

```json
  "dependencies": {
    "@graphql-codegen/plugin-helpers": "X.Y.Z",
    "tslib": "~1.11.1"
  },
  "peerDependencies": {
    "graphql": "^0.12.0 || ^0.13.0 || ^14.0.0 || ^15.0.0"
  },
```

> `graphql` must be a devDependency in order to allow developers to choose their own version.

> `tslib` is required to compile plugins.

> `@graphql-codegen/plugin-helpers` contains helpful types and utils. Make sure it has the same version as your package.

Now that your plugin is configured, you need to make sure Yarn knows about it and links it to the monorepo, so rerun the following command, in the root directory:

```sh
yarn
```

## 6. Create your plugin

To create your new plugin, create `src/index.ts` in your plugin directory, and start with the following:

```ts
import { PluginFunction, Types } from '@graphql-codegen/plugin-helpers'

export type MyPluginConfig = {
  name: string
}

export const plugin: PluginFunction<Partial<MyPluginConfig>, MyPluginConfig> = (
  schema: GraphQLSchema,
  documents: Types.DocumentFile[],
  config: TypeScriptDocumentsPluginConfig
) => {
  return `Hello ${config.name || 'anonymous'}!`
}
```

> `schema` is the merged `GraphQLSchema` object, from all sources. this will always be available for plugin.

> `documents` is an array of GraphQL operations (query/mutation/subscription/fragment). This is optional, and you can use it only if your plugin needs it.

> `config` is the merged configuration passed in the `.yaml` configuration file of the codegen.

You can follow the plugin tips in [Write Your Plugin](./write-your-plugin), [Validate Configuration](./validate-configuration) and [Using Visitor](./using-visitor) sections.

## 7. Test your plugin

To test your plugin, create a test file - `tests/plugin.spec.ts` with the following content;

```ts
import { plugin } from '../src'

describe('My Plugin', () => {
  const schema = buildSchema(/* GraphQL */ `
    type Query {
      foo: String!
    }
  `)

  it('Should greet', async () => {
    const result = await plugin(schema, [], {
      name: 'Dotan'
    })

    expect(result).toBe('Hello Dotan!')
  })
})
```

Now, to make sure it works, run the following in your plugin directory:

```sh
yarn test
```

## 8. Integration

You can also test the integration of your plugin with the codegen core and cli, the integration with other plugins and the output for some complex schemas and operations.

To do that, make sure everything is built by using `yarn build` in the root directory, then you can use it in `./dev-test/codegen.yml`, and run `yarn generate:examples` in the project root directory to run it.

## 9. Documentation

GraphQL Code Generator website has API Reference for all our plugins. Most of the documentation is generated from code, and some of it is written manually.

In order to add it to the website, do the following:

1. Add JSDoc annotations to your config object; it can also include a default value, examples, and type:

````ts
// packages/plugins/my-plugin/config.ts

/**
 * My plugin is super cool!!!
 */
export type MyPluginConfig = {
  /**
   * @name name
   * @description This allows you to generate a greeting with a custom name
   * @default anonymous
   *
   * @exampleMarkdown
   * ## Change the name
   * ```yml
   * generates:
   * path/to/file.ts:
   *  plugins:
   *    - my-plugin
   *  config:
   *    name: Uri
   * ```
   */
  name: string
}
````

Now, open `website/src/lib/plugins-docs.ts` and add a record to the `pluginsConfigurations` variable in that file, and point the file with the configuration annotation:

```ts
export const pluginsConfigurations: PluginConfig[] = [
  {
    file: '../packages/plugins/my-plugin/config.ts', // file where the Config interface/type is located
    identifier: 'MyPluginConfig', // name of the Config interface/type
    name: 'my-plugin' // name if you plugin package
  }
  // ...
]
```

> Adding your plugin here will automatically include it in the generated `config.schema.json` that provides VSCode auto-complete (try running `yarn generate-json-config` to see it in action) and will generate markdown documentation automatically based on your TypeScript types.

## 10. Website & Plugins Hub

To add your plugin to the website and [Plugin Hub](/plugins), add your plugin package information in `website/src/lib/plugins.ts`:

```ts
const PACKAGES: Package<Tags>[] = [
  {
    identifier: 'my-plugin', // package id, will be used for the url slug
    title: 'my-plugin', // page title
    npmPackage: '@graphql-codegen/my-plugin', // name of the npm package
    iconUrl: '/assets/img/icons/codegen.svg', // you can specify a custom icon, or use codegen's
    tags: ['plugin', 'utilities'], // add tags for the search engine
  },
```

Go ahead to `website` directory and run the website using `yarn dev`.

Your plugin page should be available in `http://localhost:3000/plugins/my-plugin`

## 10. Add it to the live demo (optional)

Our website has a live demo on the main page for most plugins, and you can add it there if you wish.

To add a new example to the live demo, start by making sure that your plugin package is available for the website:

1. Edit `website/package.json` and add your plugin package under `dependencies`.
1. Add your example under `website/src/components/live-demo/examples.ts` - you can add a custom schema, documents and configuration.
