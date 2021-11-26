[![CodeGen](./logo.svg)](https://graphql-code-generator.com)

[![npm version](https://badge.fury.io/js/%40graphql-codegen%2Fcli.svg)](https://badge.fury.io/js/%40graphql-codegen%2Fcli)

[graphql-code-generator.com](https://graphql-code-generator.com)

GraphQL Code Generator is a tool that generates code out of your GraphQL schema. Whether you are developing a frontend or backend, you can utilize GraphQL Code Generator to generate output from your GraphQL Schema and GraphQL Documents (query/mutation/subscription/fragment).

By analyzing the schema and documents and parsing it, GraphQL Code Generator can output code at a wide variety of formats, based on pre-defined templates or based on custom user-defined ones. Regardless of the language that you're using, GraphQL Code Generator got you covered.

GraphQL Code Generator lets you choose the output that you need, based on _plugins_, which are very flexible and customizable. You can also write your _plugins_ to generate custom outputs that match your needs.

You can try this tool live on your browser and see some useful examples. Check out [GraphQL Code Generator Live Examples](https://graphql-code-generator.com/#live-demo).

We currently support and maintain [these plugins](https://graphql-code-generator.com/plugins) (TypeScript, Flow, React, Angular, MongoDB, Stencil, Reason, and some more), and there is an active community that writes and maintains custom plugins.

### Quick Start

> You can find the complete instructions in [GraphQL-Code-Generator website](https://graphql-code-generator.com/docs/getting-started/installation).

Start by installing the basic deps of GraphQL Codegen;

    yarn add graphql
    yarn add -D @graphql-codegen/cli

GraphQL Code Generator lets you setup everything by simply running the following command:

    yarn graphql-codegen init

Question by question, it will guide you through the whole process of setting up a schema, selecting plugins, picking a destination of a generated file, and a lot more.

If you wish to [manually setup codegen, follow these instructions]((https://graphql-code-generator.com/docs/getting-started/installation)).

### Links

Besides our [docs page](https://graphql-code-generator.com/docs/getting-started), feel free to go through our published Medium articles to get a better grasp of what GraphQL Code Generator is all about:

- [All available plugins & presets](https://graphql-code-generator.com/plugins)

### Contributing

If this is your first time contributing to this project, please do read our [Contributor Workflow Guide](https://github.com/the-guild-org/Stack/blob/master/CONTRIBUTING.md) before you get started off.

Feel free to open issues and pull requests. We're always welcome support from the community.

For a contribution guide specific to this project, please refer to: http://graphql-code-generator.com/docs/custom-codegen/contributing

### Code of Conduct

Help us keep GraphQL Codegenerator open and inclusive. Please read and follow our [Code of Conduct](https://github.com/the-guild-org/Stack/blob/master/CODE_OF_CONDUCT.md) as adopted from [Contributor Covenant](https://www.contributor-covenant.org/)


### License

[![GitHub license](https://img.shields.io/badge/license-MIT-lightgrey.svg?maxAge=2592000)](https://raw.githubusercontent.com/apollostack/apollo-ios/master/LICENSE)

MIT
