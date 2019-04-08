---
id: typescript-compatibility
title: TypeScript 1.0 Compatibility
---

If you are migrating from <1.0, we created a new plugin, called `typescript-compatibility` that generates backward compatibility for the `typescript-operations` and `typescript-react-apollo` plugins.
It will generates for you types that are pointing to the new form of types. It supports _most_ of the use-cases.

To use it, start by installing from NPM:

\$ yarn add -D @graphql-codegen/typescript-compatibility

Then, add it to your codegen configuration:

```yml
./my-file.tsx:
  schema: schema.json
  plugins:
    - typescript
    - typescript-operations
    - typescript-compatibility
```

> Note: If `typescript-react-apollo` plugin also specified in your config file, it will generate backward-compatibily for it.

## Configuration

{@import: ../docs/generated-config/typescript-compatibility.md}
{@import: ../docs/generated-config/base-visitor.md}
