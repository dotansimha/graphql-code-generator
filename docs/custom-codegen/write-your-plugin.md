---
id: write-your-plugin
title: Write your first Plugin
---

## Basic Plugin

To get started with writing your GraphQL Code-Generator plugin, start by creating a simple `my-plugin.js` file in your project, with the following content:

```js
module.exports = {
  plugin: (schema, documents, config) => {
    return 'Hi!';
  },
};
```

The exported object should match the [`CodegenPlugin`](https://github.com/dotansimha/graphql-code-generator/blob/master/packages/utils/plugins-helpers/src/types.ts#L89-L93) interface.

Now, let's try to load and use it with the codegen. Specify the path to your `.js` file in your `codegen.yml` config file:

```yml
schema: my-schema.graphql
documents: './src/**/*.graphql'
generates:
  output.ts:
    - my-plugin.js
```

Now, run the `@graphql-codegen/cli` using `graphql-codegen` command, and it will create a file called `output.ts` with `Hi!`

## Using the `GraphQLSchema`

The first argument of your `plugin` function is the `GraphQLSchema`. The code-generator will make sure to merge all `GraphQLSchema`s into a single, easy-to-use object, that you can use to create your output.

You can find the full, typed, [API of `GraphQLSchema` here](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/graphql/type/schema.d.ts#L38)

So let's use a very basic method from `GraphQLSchema`, and return a list of all GraphQL types declared in the schema:

```js
module.exports = {
  plugin: (schema, documents, config, info) => {
    const typesMap = schema.getTypeMap();

    return Object.keys(typesMap).join('\n');
  },
};
```

## Using the documents

The second argument of your `plugin` method is an array of GraphQL documents. This array contains a list of `{ filePath: string, content: DocumentNode }`.

The `filePath` field is the path of the file, and `DocumentNode` is an object containing all GraphQL documents that has been found in that file.

You can find the full, typed, [API of `DocumentNode` here](https://github.com/DefinitelyTyped/DefinitelyTyped/blob/master/types/graphql/language/ast.d.ts#L186-L190)

Let's print a list of all documents files, and the name of operations in this file:

```js
module.exports = {
  plugin: (schema, documents, config, info) => {
    return documents
      .map(doc => {
        const docsNames = doc.content.definitions.map(def => def.name.value);

        return `File ${doc.filePath} contains: ${docsNames.join(', ')}`;
      })
      .join('\n');
  },
};
```

## Add plugin configuration

The third argument of your function is `config` and it includes an object with the configuration passed to your plugin.

You can use it to tweak the behavior of your plugin and allow develoeprs to customize the output easily.

You can pass configuration to your plugin in the following this way:

```yml
schema: my-schema.graphql
documents: './src/**/*.graphql'
generates:
  output.ts:
    - my-plugin.js:
        myConfig: 'some-value'
```

And then, you can use in your plugin:

```js
module.exports = {
  plugin: (schema, documents, config, info) => {
    if (extname(info.outputFile) === '.graphql') {
      return 'baz';
    }

    if (config.myConfig === 'some-value') {
      return 'foo';
    } else {
      return 'bar';
    }
  },
};
```

## Packing your Plugin

To pack your Plugin as package, create a simple `package.json` file and add the `main` field, pointing to your Plugin file.

Then, publish it to npm using `npm publish` and test it by installing the published package from npm, and use it in your YML config file:

```yml
schema: my-schema.graphql
documents: './src/**/*.graphql'
generates:
  output.ts:
    - my-custom-plugin-package
```

> If you are using TypeScript to write your plugin, don't forget to compile your `.ts` file using `tsc`, and point `main` to the compiled file.
