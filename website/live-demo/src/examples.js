import * as prettier from 'prettier/standalone';

const plugins = [require('prettier/parser-graphql'), require('prettier/parser-yaml')];

function f(strings) {
  try {
    return prettier.format(strings[0], { parser: 'graphql', plugins });
  } catch (e) {
    return strings[0];
  }
}

function yaml(strings) {
  return prettier.format(strings[0], { parser: 'yaml', plugins });
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
  'typescript-server': {
    name: 'TypeScript (Server)',
    state: {
      config: yaml`
        generates:
          server-types.ts:
            - typescript-common
            - typescript-server`,
      schema: TS_SCHEMA,
      documents: ''
    }
  },
  'typescript-client': {
    name: 'TypeScript (Client)',
    state: {
      config: yaml`
        generates:
          client-types.ts:
            - typescript-common
            - typescript-client`,
      schema: TS_SCHEMA,
      documents: TS_QUERY
    }
  },
  'typescript-client-no-namespaces': {
    name: 'TypeScript (Client, no namespaces)',
    state: {
      config: yaml`
        generates:
          client-types.ts:
            config: 
              noNamespaces: true
            plugins:
              - typescript-common
              - typescript-client`,
      schema: TS_SCHEMA,
      documents: TS_QUERY
    }
  },
  'react-apollo': {
    name: 'React-Apollo Components',
    state: {
      config: yaml`
        generates:
          components.ts:
            plugins:
              - typescript-react-apollo`,
      schema: TS_SCHEMA,
      documents: TS_QUERY
    }
  },
  'apollo-angular': {
    name: 'Apollo-Angular Components',
    state: {
      config: yaml`
        generates:
          components.ts:
            plugins:
              - typescript-apollo-angular`,
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
              - typescript-common
              - typescript-server
              - typescript-resolvers`,
      schema: TS_SCHEMA,
      documents: TS_QUERY
    }
  },
  // 'typescript-mongo': {
  //   name: 'MongoDB Models',
  //   state: {
  //     config: yaml`
  //       generates:
  //         models.ts:
  //           - typescript-mongodb`,
  //     schema: f`
  //       type User @entity {
  //         id: ID! @id
  //         username: @column
  //         email: @column @map(path: "login.email")
  //       }
  //
  //       type Query {
  //          me: User
  //          user(id: ID!): User
  //          allUsers: [User]
  //       }
  //     `,
  //     documents: TS_QUERY,
  //   },
  // },
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
