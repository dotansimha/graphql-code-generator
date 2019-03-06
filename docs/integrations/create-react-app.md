---
id: create-react-app
title: Create-React-App
---

Since v2 of [Create-React-App](https://github.com/facebook/create-react-app), you can use TypeScript without the need to eject from the basic scripts packages.

It uses `[babel-preset-typescript](https://babeljs.io/docs/en/babel-preset-typescript)` for transpiling TypeScript files, which does not support `namespace` keyword.

Some of the built-in plugins (such as `typescript-client`, `typescript-apollo-angular` and `typescript-react-apollo`) are using `namespace`. In order to use those templates with Create-React-App applications (or, any other app that using `babel-preset-typescript` instead of `tsc`), you can configure it with `noNamepsaces` field, to avoid generating output with `namespace`s.

```yml
schema: http://my-server/graphql
documents: 'src/**/*.graphql'
generates:
  components.tsx:
    plugins:
      - typescript-common
      - typescript-client
      - typescript-react-apollo
```
