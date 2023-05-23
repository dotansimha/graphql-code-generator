---
'@graphql-codegen/visitor-plugin-common': minor
'@graphql-codegen/typescript-resolvers': minor
---

Add excludeTypes config to resolversNonOptionalTypename

This disables the adding of `__typename` in resolver types for any specified typename. This could be useful e.g. if you're wanting to enable this for all new types going forward but not do a big migration.

Usage example:

```typescript
const config: CodegenConfig = {
  schema: 'src/schema/**/*.graphql',
  generates: {
    'src/schema/types.ts': {
      plugins: ['typescript', 'typescript-resolvers'],
      config: {
        resolversNonOptionalTypename: {
          unionMember: true,
          excludeTypes: ['MyType'],
        }
      }
    },
  },
};
```
