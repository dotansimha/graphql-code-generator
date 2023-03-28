---
'@graphql-codegen/visitor-plugin-common': patch
'@graphql-codegen/typescript-resolvers': patch
---

Fix `ResolversUnionTypes` being used in `ResolversParentTypes`

Previously, objects with mappable fields are converted to Omit format that references its own type group or `ResolversTypes` or `ResolversParentTypes` e.g.

```ts
export type ResolversTypes = {
  Book: ResolverTypeWrapper<BookMapper>;
  BookPayload: ResolversTypes["BookResult"] | ResolversTypes["StandardError"];
  // Note: `result` on the next line references `ResolversTypes["Book"]`
  BookResult: ResolverTypeWrapper<Omit<BookResult, "result"> & { result?: Maybe<ResolversTypes["Book"]> }>;
  StandardError: ResolverTypeWrapper<StandardError>;
};

export type ResolversParentTypes = {
  Book: BookMapper;
  BookPayload: ResolversParentTypes["BookResult"] | ResolversParentTypes["StandardError"];
  // Note: `result` on the next line references `ResolversParentTypes["Book"]`
  BookResult: Omit<BookResult, "result"> & { result?: Maybe<ResolversParentTypes["Book"]> };
  StandardError: StandardError;
};
```

In https://github.com/dotansimha/graphql-code-generator/pull/9069, we extracted resolver union types to its own group:

```ts
export type ResolversUnionTypes = {
  // Note: `result` on the next line references `ResolversTypes["Book"]` which is only correct for the `ResolversTypes` case
  BookPayload: (Omit<BookResult, "result"> & { result?: Maybe<ResolversTypes["Book"]> }) | StandardError;
};

export type ResolversTypes = {
  Book: ResolverTypeWrapper<BookMapper>;
  BookPayload: ResolverTypeWrapper<ResolversUnionTypes["BookPayload"]>;
  BookResult: ResolverTypeWrapper<Omit<BookResult, "result"> & { result?: Maybe<ResolversTypes["Book"]> }>;
  StandardError: ResolverTypeWrapper<StandardError>;
};

export type ResolversParentTypes = {
  Book: BookMapper;
  BookPayload: ResolversUnionTypes["BookPayload"];
  BookResult: Omit<BookResult, "result"> & { result?: Maybe<ResolversParentTypes["Book"]> };
  StandardError: StandardError;
};
```

This change creates an extra `ResolversUnionParentTypes` that is referenced by `ResolversParentTypes` to ensure backwards compatibility:

```ts
export type ResolversUnionTypes = {
  BookPayload: (Omit<BookResult, "result"> & { result?: Maybe<ResolversParentTypes["Book"]> }) | StandardError;
};

// ... and the reference is changed in ResolversParentTypes:
export type ResolversParentTypes = {
  // ... other fields
  BookPayload: ResolversUnionParentTypes["BookPayload"];
};
```
