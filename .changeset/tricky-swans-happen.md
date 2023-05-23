---
'@graphql-codegen/visitor-plugin-common': minor
'@graphql-codegen/typescript-resolvers': minor
---

Extract interfaces to ResolversInterfaceTypes and add to resolversNonOptionalTypename

1. `ResolversInterfaceTypes` is a new type that keeps track of a GraphQL interface and its implementing types.

For example, consider this schema:

```graphql
extend type Query {
  character(id: ID!): CharacterNode
}

interface CharacterNode {
  id: ID!
}

type Wizard implements CharacterNode {
  id: ID!
  screenName: String!
  spells: [String!]!
}

type Fighter implements CharacterNode {
  id: ID!
  screenName: String!
  powerLevel: Int!
}
```

The generated types will look like this:

```ts
export type ResolversInterfaceTypes<RefType extends Record<string, unknown>> = {
  CharacterNode: Fighter | Wizard;
};

export type ResolversTypes = {
  // other types...
  CharacterNode: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>["CharacterNode"]>;
  Fighter: ResolverTypeWrapper<Fighter>;
  Wizard: ResolverTypeWrapper<Wizard>;
  // other types...
};

export type ResolversParentTypes = {
  // other types...
  CharacterNode: ResolversInterfaceTypes<ResolversParentTypes>["CharacterNode"];
  Fighter: Fighter;
  Wizard: Wizard;
  // other types...
};
```

The `RefType` generic is used to reference back to `ResolversTypes` and `ResolversParentTypes` in some cases such as field returning a Union.

2. `resolversNonOptionalTypename` also affects `ResolversInterfaceTypes`

Using the schema above, if we use `resolversNonOptionalTypename` option:

```typescript
const config: CodegenConfig = {
  schema: 'src/schema/**/*.graphql',
  generates: {
    'src/schema/types.ts': {
      plugins: ['typescript', 'typescript-resolvers'],
      config: {
        resolversNonOptionalTypename: true // Or `resolversNonOptionalTypename: { interfaceImplementingType: true }`
      }
    },
  },
};
```

Then, the generated type looks like this:

```ts
export type ResolversInterfaceTypes<RefType extends Record<string, unknown>> = {
  CharacterNode: (Fighter & { __typename: "Fighter" }) | (Wizard & { __typename: "Wizard" });
};

export type ResolversTypes = {
  // other types...
  CharacterNode: ResolverTypeWrapper<ResolversInterfaceTypes<ResolversTypes>["CharacterNode"]>;
  Fighter: ResolverTypeWrapper<Fighter>;
  Wizard: ResolverTypeWrapper<Wizard>;
  // other types...
};

export type ResolversParentTypes = {
  // other types...
  CharacterNode: ResolversInterfaceTypes<ResolversParentTypes>["CharacterNode"];
  Fighter: Fighter;
  Wizard: Wizard;
  // other types...
};
```
