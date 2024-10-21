---
'@graphql-codegen/client-preset': minor
---

Forward `onlyOperationTypes` and `onlyEnumTypes` for client preset, warn if used.

Client preset doesn't need certain types to be generated to work. As the result, `onlyOperationTypes` and `onlyEnumTYpes` were set to `true` to reduce unncessary generated templates. The forward of said options helps users - who may have used these types for non client preset purposes e.g. generating test mocks, etc. - migrate off these types.

To migrate off these types, generate separate file for non client preset purposes. For example:

```ts
{
  generates: {
    'src/graphql/types.generated.ts': {
      plugins: ['typescript']
    }
  }
}
```

These options will be removed in the next major version.
