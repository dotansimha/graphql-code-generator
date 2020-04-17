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
    config: `generates:
  server-types.ts:
    - typescript`,
    schema: TS_SCHEMA,
    documents: '',
  },
  'typescript-operations': {
    name: 'TypeScript Operations',
    config: `generates:
  client-types.ts:
    - typescript
    - typescript-operations`,
    schema: TS_SCHEMA,
    documents: TS_QUERY,
  },
  'typescript-operations-no-pick': {
    name: 'TypeScript Operations (without Pick)',
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
  'typescript-operations-compatibility': {
    name: 'TypeScript Operations with 0.18 Compatibility',
    config: `generates:
  client-types.ts:
    - typescript
    - typescript-operations
    - typescript-compatibility`,
    schema: TS_SCHEMA,
    documents: TS_QUERY,
  },
  'react-apollo': {
    name: 'TypeScript React-Apollo Components',
    config: `generates:
  components.tsx:
    plugins:
      - typescript
      - typescript-operations
      - typescript-react-apollo`,
    schema: TS_SCHEMA,
    documents: TS_QUERY,
  },
  'vue-apollo': {
    name: 'TypeScript Vue-Apollo composition functions',
    config: `generates:
  composition-functions.ts:
    plugins:
      - typescript
      - typescript-operations
      - typescript-vue-apollo`,
    schema: TS_SCHEMA,
    documents: TS_QUERY,
  },
  'apollo-angular': {
    name: 'TypeScript Apollo-Angular Components',
    config: `generates:
  components.ts:
    plugins:
      - typescript
      - typescript-operations
      - typescript-apollo-angular`,
    schema: TS_SCHEMA,
    documents: TS_QUERY,
  },
  'typescript-urql': {
    name: 'TypeScript urql',
    config: `generates:
  components.tsx:
    plugins:
      - typescript
      - typescript-operations
      - typescript-urql`,
    schema: TS_SCHEMA,
    documents: TS_QUERY,
  },
  'stencil-apollo': {
    name: 'TypeScript Stencil-Apollo Components',
    config: `generates:
  components.tsx:
    plugins:
      - typescript
      - typescript-operations
      - typescript-stencil-apollo`,
    schema: TS_SCHEMA,
    documents: TS_QUERY,
  },
  'typescript-server-resolvers': {
    name: 'TypeScript Resolvers Signature',
    config: `generates:
  resolvers.ts:
    plugins:
      - typescript
      - typescript-resolvers`,
    schema: TS_SCHEMA,
    documents: TS_QUERY,
  },
  java: {
    name: 'Java (Enum & Input)',
    config: `generates:
  src/main/java/my/app/generated/Types.java:
    - java`,
    schema: TS_SCHEMA,
    documents: '',
  },
  'java-resolvers': {
    name: 'Java Resolvers Signature',
    config: `generates:
  src/main/java/my/app/generated/Resolvers.java:
    - java-resolvers`,
    schema: TS_SCHEMA,
    documents: '',
  },
  flow: {
    name: 'Flow',
    config: `generates:
  types.flow.js:
    - flow
    `,
    schema: TS_SCHEMA,
    documents: '',
  },
  flowResolvers: {
    name: 'Flow Resolvers Signature',
    config: `generates:
  resolvers.flow.js:
    - flow
    - flow-resolvers
    `,
    schema: TS_SCHEMA,
    documents: '',
  },
  flowDocuments: {
    name: 'Flow Operations',
    config: `generates:
  types.flow.js:
    - flow
    - flow-operations
    `,
    schema: TS_SCHEMA,
    documents: TS_QUERY,
  },
  'typescript-mongo': {
    name: 'TypeScript MongoDB',
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
  introspection: {
    name: 'Introspection JSON',
    config: `generates:
  schema.json:
    - introspection`,
    schema: TS_SCHEMA,
    documents: '',
  },
  'schema-ast': {
    name: 'Schema AST',
    config: `generates:
  schema.graphql:
    - schema-ast`,
    schema: TS_SCHEMA,
    documents: '',
  },
  'fragment-matcher': {
    name: 'Fragment Matcher',
    config: `generates:
  fragment-matcher.json:
    - fragment-matcher`,
    schema: TS_SCHEMA,
    documents: '',
  },
};
