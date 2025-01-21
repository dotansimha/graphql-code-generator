---
'@graphql-codegen/client-preset': major
---

BREAKING CHANGE: Avoid generating unused types

Previously client preset was generating a lot of types not used by the preset itself. This usually adds 100% more generated code than what's needed. This behaviour gets worse for bigger codebases. This version removes these unused types.

For users who have used these types (e.g. testing, generating mocks, etc.), it is recommended to generate another file for non client preset purposes:

```ts
const config: CodegenConfig = {
  generates: {
    "src/graphql/": {
      preset: 'client',
      // ... other config
    },
    "src/graphql/types.generated.ts": { // Use this file for non client preset purposes
      plugins: ['typescript']
    }
  }
}
```
