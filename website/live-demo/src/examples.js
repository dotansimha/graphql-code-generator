import * as prettier from 'prettier/standalone';

const plugins = [require('prettier/parser-graphql'), require('prettier/parser-yaml')];

function f(strings) {
  try {
    return prettier.format(strings[0], { parser: 'graphql', plugins, tabWidth: 2 });
  } catch (e) {
    return strings[0];
  }
}

function yaml(strings) {
  return prettier.format(strings[0], { parser: 'yaml', plugins, tabWidth: 2 });
}

const TS_SCHEMA = f`
  schema {
    query: Query
  }
  
  type Query {
     me: User
     user(id: ID!): User
     allUsers: [User]
  }
  
  enum Role {
    USER,
    ADMIN,
  }
  
  type User {
    id: ID!
    username: String!
    email: String!
    role: Role!
  }`;

const TS_QUERY = f`
  query findUser($userId: ID!) {
    user(id: $userId) {
      ...UserFields
    }
  }
  
  fragment UserFields on User {
    id
    username
    role
  }
  `;

export const EXAMPLES = {
  typescript: {
    name: 'TypeScript',
    state: {
      config: yaml`
        generates:
          server-types.ts:
            - add: "/* tslint:disable */"
            - time
            - typescript`,
      schema: TS_SCHEMA,
      documents: ''
    }
  },
  'typescript-operations': {
    name: 'TypeScript (Types and documents)',
    state: {
      config: yaml`
        generates:
          client-types.ts:
            - add: "// THIS IS A GENERATED FILE, DO NOT EDIT IT!"
            - typescript
            - typescript-operations`,
      schema: TS_SCHEMA,
      documents: TS_QUERY
    }
  },
  'react-apollo': {
    name: 'TypeScript React-Apollo Components',
    state: {
      config: yaml`
        generates:
          components.tsx:
            plugins:
              - typescript
              - typescript-operations
              - typescript-react-apollo`,
      schema: TS_SCHEMA,
      documents: TS_QUERY
    }
  },
  'apollo-angular': {
    name: 'TypeScript Apollo-Angular Components',
    state: {
      config: yaml`
        generates:
          components.ts:
            plugins:
              - typescript
              - typescript-operations
              - typescript-apollo-angular`,
      schema: TS_SCHEMA,
      documents: TS_QUERY
    }
  },
  'stencil-apollo': {
    name: 'TypeScript Stencil-Apollo Components',
    state: {
      config: yaml`
        generates:
          components.tsx:
            plugins:
              - typescript
              - typescript-operations
              - typescript-stencil-apollo`,
      schema: TS_SCHEMA,
      documents: TS_QUERY
    }
  },
  'typescript-server-resolvers': {
    name: 'TypeScript Resolvers Signature',
    state: {
      config: yaml`
        generates:
          resolvers.ts:
            plugins:
              - typescript
              - typescript-resolvers`,
      schema: TS_SCHEMA,
      documents: TS_QUERY
    }
  },
  flow: {
    name: 'Flow (Types)',
    state: {
      config: yaml`
        generates:
          types.flow.js:
            - flow
            `,
      schema: TS_SCHEMA,
      documents: ''
    }
  },
  flowResolvers: {
    name: 'Flow (resolvers signature)',
    state: {
      config: yaml`
        generates:
          resolvers.flow.js:
            - flow
            - flow-resolvers
            `,
      schema: TS_SCHEMA,
      documents: ''
    }
  },
  flowDocuments: {
    name: 'Flow (Types and documents)',
    state: {
      config: yaml`
        generates:
          types.flow.js:
            - flow
            - flow-operations
            `,
      schema: TS_SCHEMA,
      documents: TS_QUERY
    }
  },
  'typescript-mongo': {
    name: 'MongoDB Models',
    state: {
      config: yaml`
        generates:
          models.ts:
            - typescript-mongodb`,
      schema: f`
      type User @entity {
        id: ID! @id
        username: String! @column
        email: String! @column @map(path: "login.email")
        profile: Profile! @column
        chats: [Chat!]! @link
      }
      
      type Profile @entity(embedded: true, additionalFields: [
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
      documents: ''
    }
  },
  introspection: {
    name: 'Introspection JSON',
    state: {
      config: yaml`
        generates:
          schema.json:
            - introspection`,
      schema: TS_SCHEMA,
      documents: ''
    }
  },
  'schema-ast': {
    name: 'Schema AST',
    state: {
      config: yaml`
        generates:
          schema.graphql:
            - schema-ast`,
      schema: TS_SCHEMA,
      documents: ''
    }
  }
};
