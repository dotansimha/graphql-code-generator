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
  typescript: {
    name: 'TypeScript',
    state: {
      config: `generates:
  server-types.ts:
    - typescript`,
      schema: TS_SCHEMA,
      documents: '',
    },
  },
  'typescript-operations': {
    name: 'TypeScript Operations',
    state: {
      config: `generates:
  client-types.ts:
    - typescript
    - typescript-operations`,
      schema: TS_SCHEMA,
      documents: TS_QUERY,
    },
  },
  'typescript-operations-compatibility': {
    name: 'TypeScript Operations with 0.18 Compatibility',
    state: {
      config: `generates:
  client-types.ts:
    - typescript
    - typescript-operations
    - typescript-compatibility`,
      schema: TS_SCHEMA,
      documents: TS_QUERY,
    },
  },
  'react-apollo': {
    name: 'TypeScript React-Apollo Components',
    state: {
      config: `generates:
  components.tsx:
    plugins:
      - typescript
      - typescript-operations
      - typescript-react-apollo`,
      schema: TS_SCHEMA,
      documents: TS_QUERY,
    },
  },
  'apollo-angular': {
    name: 'TypeScript Apollo-Angular Components',
    state: {
      config: `generates:
  components.ts:
    plugins:
      - typescript
      - typescript-operations
      - typescript-apollo-angular`,
      schema: TS_SCHEMA,
      documents: TS_QUERY,
    },
  },
  'stencil-apollo': {
    name: 'TypeScript Stencil-Apollo Components',
    state: {
      config: `generates:
  components.tsx:
    plugins:
      - typescript
      - typescript-operations
      - typescript-stencil-apollo`,
      schema: TS_SCHEMA,
      documents: TS_QUERY,
    },
  },
  'typescript-server-resolvers': {
    name: 'TypeScript Resolvers Signature',
    state: {
      config: `generates:
  resolvers.ts:
    plugins:
      - typescript
      - typescript-resolvers`,
      schema: TS_SCHEMA,
      documents: TS_QUERY,
    },
  },
  java: {
    name: 'Java (Enum & Input)',
    state: {
      config: `generates:
  src/main/java/my/app/generated/Types.java:
    - java`,
      schema: TS_SCHEMA,
      documents: '',
    },
  },
  'java-resolvers': {
    name: 'Java Resolvers Signature',
    state: {
      config: `generates:
  src/main/java/my/app/generated/Resolvers.java:
    - java-resolvers`,
      schema: TS_SCHEMA,
      documents: '',
    },
  },
  flow: {
    name: 'Flow',
    state: {
      config: `generates:
  types.flow.js:
    - flow
    `,
      schema: TS_SCHEMA,
      documents: '',
    },
  },
  flowResolvers: {
    name: 'Flow Resolvers Signature',
    state: {
      config: `generates:
  resolvers.flow.js:
    - flow
    - flow-resolvers
    `,
      schema: TS_SCHEMA,
      documents: '',
    },
  },
  flowDocuments: {
    name: 'Flow Operations',
    state: {
      config: `generates:
  types.flow.js:
    - flow
    - flow-operations
    `,
      schema: TS_SCHEMA,
      documents: TS_QUERY,
    },
  },
  'typescript-mongo': {
    name: 'TypeScript MongoDB',
    state: {
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
  },
  introspection: {
    name: 'Introspection JSON',
    state: {
      config: `generates:
  schema.json:
    - introspection`,
      schema: TS_SCHEMA,
      documents: '',
    },
  },
  'schema-ast': {
    name: 'Schema AST',
    state: {
      config: `generates:
  schema.graphql:
    - schema-ast`,
      schema: TS_SCHEMA,
      documents: '',
    },
  },
  'fragment-matcher': {
    name: 'Fragment Matcher',
    state: {
      config: `generates:
  fragment-matcher.json:
    - fragment-matcher`,
      schema: TS_SCHEMA,
      documents: '',
    },
  },
};
