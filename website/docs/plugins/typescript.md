---
id: typescript
title: TypeScript
---

This is the most basic TypeScript plugin and it can generate typings based on `GraphQLSchema`, which can be used by any other typescript related plugin.

It generates types for your entire schema: types, input types, enums, interfaces, scalars and unions.

## Installation

Install using `yarn`:

    $ yarn add -D @graphql-codegen/typescript 

## Configuration

{@import ../generated-config/base-visitor.md} 

{@import ../generated-config/base-types-visitor.md}

{@import ../generated-config/typescript.md}
