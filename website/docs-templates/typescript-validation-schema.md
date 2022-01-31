---
id: typescript-validation-schema
---

_Built and maintained by [Code-Hex](https://github.com/Code-Hex)_

A plugin for GraphQL Codegen to generate form validation schema (such as [yup](https://github.com/jquense/yup), [zod](https://github.com/colinhacks/zod)) based on your GraphQL schema for use in a client application.

## Examples

Set up your project per the GraphQL Codegen Docs, and specify this plugin in your codegen.yml:

```yml
generates:
  path/to/graphql.ts:
    plugins:
      - typescript
      - typescript-validation-schema # specify to use this plugin
    config:
      # You can put the config for typescript plugin here
      # see: https://www.graphql-code-generator.com/plugins/typescript
      strictScalars: true
      # You can also write the config for this plugin together
      schema: yup # or zod
```

## Usage & Documentation

For the complete documentation, please refer to [Code-Hex/graphql-codegen-typescript-validation-schema](https://github.com/Code-Hex/graphql-codegen-typescript-validation-schema) repository.
