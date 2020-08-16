To use the GraphQL Code Generator with Java, start by adding the [com.moowork.node](https://plugins.gradle.org/plugin/com.moowork.node) Gradle plugin to your `build.gradle`:

```
plugins {
  id "com.moowork.node" version "1.3.1"
}
```

Then, add the following in order to make sure you are running the code-generator on each build:

```
build.dependsOn yarn
```

Then, create a `package.json` file in your project root, with the following content:

```json
{
  "name": "java-app",
  "scripts": {
    "postinstall": "graphql-codegen"
  },
  "dependencies": {
    "graphql": "14.5.8",
    "@graphql-codegen/cli": "1.7.0",
    "@graphql-codegen/RELEVANT_PLUGIN": "1.7.0"
  }
}
```

> Make sure to use the latest version of codegen and the plugins, and replace `RELEVANT_PLUGIN` with your plugin name.

Then, create `codegen.yml` file in your root directory, pointing to your schema, and add the plugins you need. For example:

```
schema: src/main/resources/schema.graphqls
generates:
  src/main/java/com/my-name/my-app/generated/File.java:
    - RELEVANT_PLUGIN
```

> Replace `RELEVANT_PLUGIN` with your plugin name.

Also, make sure you add the following to your `.gitignore` file:

```
yarn.lock
node_modules
```

Now, run `gradle yarn` to install the dependencies for the first time.

Next time, the codegen will run automatically each time you run your Gradle build script.
