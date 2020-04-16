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
      - typescript`,
      schema: TS_SCHEMA,
      documents: '',
    },
    {
      name: 'Operations types',
      config: `generates:
  client-types.ts:
    - typescript
    - typescript-operations`,
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
      name: 'urql',
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
      documents: TS_QUERY,
    },
    {
      name: 'MongoDB Models',
      config: `generates:
    models.ts:
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
  Java: [
    {
      name: 'Types (Enum & Input)',
      config: `generates:
  src/main/java/my/app/generated/Types.java:
    - java`,
      schema: TS_SCHEMA,
      documents: '',
    },
    {
      name: 'Resolvers Signature',
      config: `generates:
  src/main/java/my/app/generated/Resolvers.java:
    - java-resolvers`,
      schema: TS_SCHEMA,
      documents: '',
    },
  ],
  Flow: [
    {
      name: 'Types',
      config: `generates:
  types.flow.js:
    - flow
    `,
      schema: TS_SCHEMA,
      documents: '',
    },
    {
      name: 'Resolvers Signature',
      config: `generates:
  resolvers.flow.js:
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
    - introspection`,
      schema: TS_SCHEMA,
      documents: '',
    },
    {
      name: 'Schema AST',
      config: `generates:
  schema.graphql:
    - schema-ast`,
      schema: TS_SCHEMA,
      documents: '',
    },
    {
      name: 'Fragment Matcher',
      config: `generates:
  fragment-matcher.json:
    - fragment-matcher`,
      schema: TS_SCHEMA,
      documents: '',
    },
  ],
};
