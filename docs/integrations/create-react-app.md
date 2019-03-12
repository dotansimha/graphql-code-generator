---
id: create-react-app
title: Create-React-App
---

Since v2 of [Create-React-App](https://github.com/facebook/create-react-app), you can use TypeScript without the need to eject from the basic scripts packages.

```yml
schema: http://my-server/graphql
documents: 'src/**/*.graphql'
generates:
  components.tsx:
    plugins:
      - typescript
      - typescript-operations
      - typescript-react-apollo
```
