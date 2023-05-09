---
'@graphql-codegen/visitor-plugin-common': minor
'@graphql-codegen/typescript-operations': minor
'@graphql-codegen/typescript': minor
'@graphql-codegen/typescript-resolvers': minor
---

Implement Scalars with input/output types

In GraphQL, Scalar types can be different for client and server. For example, given the native GraphQL ID:
- A client may send `string` or `number` in the input
- A client receives `string` in its selection set (i.e output)
- A server receives `string` in the resolver (GraphQL parses `string` or `number` received from the client to `string`)
- A server may return `string` or `number` (GraphQL serializes the value to `string` before sending it to the client )

Currently, we represent every Scalar with only one type. This is what codegen generates as base type:

```ts
export type Scalars = {
  ID: string;
}
```

Then, this is used in both input and output type e.g.

```ts
export type Book = {
  __typename?: "Book";
  id: Scalars["ID"]; // Output's ID can be `string` 👍
};

export type QueryBookArgs = {
  id: Scalars["ID"]; // Input's ID can be `string` or `number`. However, the type is only `string` here 👎
};
```

This PR extends each Scalar to have input and output:

```ts
export type Scalars = {
  ID: {
    input: string | number;
    output: string;
  }
}
```

Then, each input/output GraphQL type can correctly refer to the correct input/output scalar type:

```ts
export type Book = {
  __typename?: "Book";
  id: Scalars["ID"]['output']; // Output's ID can be `string` 👍
};

export type QueryBookArgs = {
  id: Scalars["ID"]['input']; // Input's ID can be `string` or `number` 👍
};
```

Note that for `typescript-resolvers`, the type of ID needs to be inverted. However, the referenced types in GraphQL input/output types should still work correctly:

```ts
export type Scalars = {
  ID: {
    input: string;
    output: string | number;
  }
}

export type Book = {
  __typename?: "Book";
  id: Scalars["ID"]['output']; // Resolvers can return `string` or `number` in ID fields 👍
};

export type QueryBookArgs = {
  id: Scalars["ID"]['input']; // Resolvers receive `string` in ID fields 👍
};

export type ResolversTypes = {
  ID: ID: ResolverTypeWrapper<Scalars['ID']['output']>; // Resolvers can return `string` or `number` in ID fields 👍
}

export type ResolversParentTypes = {
  ID: Scalars['ID']['output']; // Resolvers receive `string` or `number` from parents 👍
};
```

---

Config changes:

1. Scalars option can now take input/output types:

```ts
config: {
  scalars: {
    ID: {
      input: 'string',
      output: 'string | number'
    }
  }
}
```

2. If a string is given (instead of an object with input/output fields), it will be used as both input and output types:

```ts
config: {
  scalars: {
    ID: 'string' // Means it `string` will be used for both ID's input and output types
  }
}
```

3. (Potential) BREAKING CHANGE: External module Scalar types need to be an object with input/output fields

```ts
config: {
  scalars: {
    ID: './path/to/scalar-module'
  }
}
```

If correctly, wired up, the following will be generated:

```ts
// Previously, imported `ID` type can be a primitive type, now it must be an object with input/output fields
import { ID } from "./path/to/scalar-module";

export type Scalars = {
  ID: { input: ID['input']; output: ID['output']; }
};
```

---

(Potential) BREAKING CHANGE: This changes Scalar types which could be referenced in other plugins. If you are a plugin maintainer and reference Scalar, please update your plugin to use the correct input/output types.
