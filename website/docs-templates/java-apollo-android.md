---
id: java-apollo-android
---

{@apiDocs}

## Prepare your env

To get started with these plugins and preset, make sure you have the following installed:

- NodeJS (10 or later)
- NPM or Yarn

Run the following in your Android project:

```sh
yarn init --yes
yarn add @graphql-codegen/cli graphql @graphql-codegen/java-apollo-android
```

Then, create `codegen.yml` with the following configuration:

```yml
schema: POINT_TO_YOUR_SCHEMA
documents: POINT_TO_YOUR_GRAPHQL_OPERATIONS
generates:
  ./app/src/main/java/:
    preset: java-apollo-android
    config:
      package: 'com.my.app.generated.graphql'
      fragmentPackage: 'com.my.app.generated.graphql'
      typePackage: 'type'
    plugins:
      - java-apollo-android
```

> Also, make sure to add `node_modules` to your `.gitignore` file.

To integrate with your Gradle build, you can add the following to your app Gradle file:

```
preBuild.doFirst {
    def proc = "yarn graphql-codegen".execute()
    proc.waitForProcessOutput(System.out, System.err)
}

build.dependsOn preBuild
```

This will make sure to run and generate output before each time you build your project.

## Usage

You can find a [repository with a working example using AppSync](https://github.com/dotansimha/graphql-codegen-appsync-android-example)
