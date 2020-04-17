const TS_SCHEMA = `scalar Date

schema {
  query: Query
}

type Query {
  me: User!
  user(id: ID!): User
  allUsers: [User]
  search(term: String!): [SearchResult!]!
  myChats: [Chat!]!
}

enum Role {
  USER,
  ADMIN,
}

interface Node {
  id: ID!
}

union SearchResult = User | Chat | ChatMessage

type User implements Node {
  id: ID!
  username: String!
  email: String!
  role: Role!
}

type Chat implements Node {
  id: ID!
  users: [User!]!
  messages: [ChatMessage!]!
}

type ChatMessage implements Node {
  id: ID!
  content: String!
  time: Date!
  user: User!
}
`;

const TS_QUERY = `query findUser($userId: ID!) {
  user(id: $userId) {
    ...UserFields
  }
}

fragment UserFields on User {
  id
  username
  role
}`;

export const EXAMPLES = {
  TypeScript: [
    {
      name: 'Schema types',
      config: `generates:
    server-types.ts:
      plugins:
        - typescript`,
      schema: TS_SCHEMA,
      documents: '',
    },
    {
      name: 'Operations types',
      config: `generates:
  client-types.ts:
    plugins:
      - typescript
      - typescript-operations`,
      schema: TS_SCHEMA,
      documents: TS_QUERY,
    },
    {
      name: 'Operations types (near-operation-file)',
      config: `generates:
  ./types.ts:
    plugins:
      - typescript
  ./:
    preset: near-operation-file
    presetConfig:
      extension: .generated.tsx
      baseTypesPath: types.ts
    plugins:
      - typescript-operations
      - typescript-react-apollo`,
      schema: TS_SCHEMA,
      documents: TS_QUERY,
    },
    {
      name: 'Operations types (without Pick)',
      config: `generates:
  client-types.ts:
    config:
      preResolveTypes: true
    plugins:
      - typescript
      - typescript-operations`,
      schema: TS_SCHEMA,
      documents: TS_QUERY,
    },
    {
      name: 'React-Apollo Hooks',
      config: `generates:
  components.tsx:
    config:
      withHooks: true
      withComponent: false
      withHOC: false
    plugins:
      - typescript
      - typescript-operations
      - typescript-react-apollo`,
      schema: TS_SCHEMA,
      documents: TS_QUERY,
    },
    {
      name: 'Vue-Apollo composition functions',
      config: `generates:
  composition-functions.ts:
    plugins:
      - typescript
      - typescript-operations
      - typescript-vue-apollo`,
      schema: TS_SCHEMA,
      documents: TS_QUERY,
    },
    {
      name: 'Apollo-Angular Components',
      config: `generates:
  components.ts:
    plugins:
      - typescript
      - typescript-operations
      - typescript-apollo-angular`,
      schema: TS_SCHEMA,
      documents: TS_QUERY,
    },
    {
      name: 'Urql',
      config: `generates:
  components.tsx:
    plugins:
      - typescript
      - typescript-operations
      - typescript-urql`,
      schema: TS_SCHEMA,
      documents: TS_QUERY,
    },
    {
      name: 'Stencil-Apollo Components',
      config: `generates:
  components.tsx:
    plugins:
      - typescript
      - typescript-operations
      - typescript-stencil-apollo`,
      schema: TS_SCHEMA,
      documents: TS_QUERY,
    },
    {
      name: 'Resolvers Signature',
      config: `generates:
  resolvers.ts:
    plugins:
      - typescript
      - typescript-resolvers`,
      schema: TS_SCHEMA,
      documents: '',
    },
    {
      name: 'Resolvers Signature (with custom models)',
      config: `generates:
  resolvers.ts:
    config:
      mappers:
        User: ./models#UserDbObject
        Chat: ./models#ChatModel
    plugins:
      - typescript
      - typescript-resolvers`,
      schema: TS_SCHEMA,
      documents: '',
    },
    {
      name: 'graphql-request typed SDK',
      config: `generates:
  sdk.ts:
    plugins:
      - typescript
      - typescript-graphql-request`,
      schema: TS_SCHEMA,
      documents: TS_QUERY,
    },
    {
      name: 'Generic SDK',
      config: `generates:
  sdk.ts:
    plugins:
      - typescript
      - typescript-generic-sdk`,
      schema: TS_SCHEMA,
      documents: TS_QUERY,
    },
    {
      name: 'type-graphql',
      config: `generates:
  types.ts:
    plugins:
      - typescript-type-graphql`,
      schema: TS_SCHEMA,
      documents: '',
    },
    {
      name: 'MongoDB Models',
      config: `generates:
    models.ts:
      plugins:
        - typescript-mongodb`,
      schema: `type User @entity {
    id: ID! @id
    username: String! @column
    email: String! @column @map(
      path: "login.email"
    )
    profile: Profile! @column
    chats: [Chat!]! @link
  }
  
  type Profile @entity(embedded: true,
    additionalFields: [
      { path: "dateOfBirth", type: "string" }
    ]) {
    name: String! @column
    age: Int
  }
  
  type Chat @entity {
    id: ID! @id
    users: [User!]! @link
    messages: [ChatMessage!]!
  }
  
  type ChatMessage @entity {
    id: ID! @id
    chat: Chat! @link
    content: String! @column
    author: User! @link
  }
  `,
      documents: '',
    },
  ],
  '.NET': [
    {
      name: 'C# Schema types',
      config: `generates:
  src/main/c-sharp/my-org/my-app/Types.cs:
    plugins:
      - c-sharp`,
      schema: TS_SCHEMA,
      documents: '',
    },
    {
      name: 'C# Operations',
      config: `generates:
  src/main/c-sharp/my-org/my-app/Operations.cs:
    plugins:
      - c-sharp-operations`,
      schema: TS_SCHEMA,
      documents: TS_QUERY,
    },
  ],
  Java: [
    {
      name: 'Types (Enum & Input)',
      config: `generates:
  src/main/java/my/app/generated/Types.java:
    plugins:
      - java`,
      schema: TS_SCHEMA,
      documents: '',
    },
    {
      name: 'Resolvers Signature',
      config: `generates:
  src/main/java/my/app/generated/Resolvers.java:
    plugins:
      - java-resolvers`,
      schema: TS_SCHEMA,
      documents: '',
    },
    {
      name: 'Apollo Android',
      config: `generates:
  ./app/src/main/java/:
    preset: java-apollo-android
    config:
      package: "com.my.paackage.generated.graphql"
      typePackage: "com.my.paackage.generated.Types"
      fragmentPackage: "com.my.paackage.generated.Fragment"
    plugins:
      - java-apollo-android`,
      schema: TS_SCHEMA,
      documents: TS_QUERY,
    },
  ],
  Flow: [
    {
      name: 'Schema types',
      config: `generates:
  types.flow.js:
    plugins:
      - flow
    `,
      schema: TS_SCHEMA,
      documents: '',
    },
    {
      name: 'Resolvers Signature',
      config: `generates:
  resolvers.flow.js:
    plugins:
      - flow
      - flow-resolvers
    `,
      schema: TS_SCHEMA,
      documents: '',
    },
    {
      name: 'Operations types',
      config: `generates:
  types.flow.js:
    plugins:
      - flow
      - flow-operations
    `,
      schema: TS_SCHEMA,
      documents: TS_QUERY,
    },
  ],
  Other: [
    {
      name: 'Introspection JSON',
      config: `generates:
  schema.json:
    plugins:
      - introspection`,
      schema: TS_SCHEMA,
      documents: '',
    },
    {
      name: 'Schema AST',
      config: `generates:
  schema.graphql:
    plugins:
      - schema-ast`,
      schema: TS_SCHEMA,
      documents: '',
    },
    {
      name: 'Fragment Matcher',
      config: `generates:
  fragment-matcher.json:
    plugins:
      - fragment-matcher`,
      schema: TS_SCHEMA,
      documents: '',
    },
  ],
};
