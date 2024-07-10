import '@graphql-codegen/testing';
import { plugin } from '../src/index.js';
import { buildSchema } from 'graphql';

describe('TypeScript Resolvers Plugin - Meta', () => {
  it('generates meta correctly', async () => {
    const result = await plugin(
      buildSchema(/* GraphQL */ `
        type Query {
          user(id: ID!): User
          post(id: ID!): Post
        }

        type Mutation {
          createUser(name: String!): CreateUserPayload!
        }

        interface Node {
          id: ID!
        }
        type Post implements Node {
          id: ID!
          author: User
        }
        type User implements Node {
          id: ID!
          name: String
        }

        type CreateUserOk {
          user: User!
        }

        type CreateUserError {
          error: ErrorType!
        }

        union CreateUserPayload = CreateUserOk | CreateUserError

        enum ErrorType {
          FORBIDDEN_ERROR
          INTERNAL_ERROR
        }
      `),
      [],
      {
        namingConvention: 'change-case-all#snakeCase',
        enumValues: {
          ErrorType: {
            FORBIDDEN_ERROR: '403',
            INTERNAL_ERROR: '500',
          },
        },
      },
      { outputFile: '' }
    );

    expect(result.content).toBeSimilarStringTo(`
      export type resolvers<ContextType = any> = {
        Query?: query_resolvers<ContextType>;
        Mutation?: mutation_resolvers<ContextType>;
        Node?: node_resolvers<ContextType>;
        Post?: post_resolvers<ContextType>;
        User?: user_resolvers<ContextType>;
        CreateUserOk?: create_user_ok_resolvers<ContextType>;
        CreateUserError?: create_user_error_resolvers<ContextType>;
        CreateUserPayload?: create_user_payload_resolvers<ContextType>;
        ErrorType?: error_type_resolvers;
      };`);
    expect(result.content).toContain(`export type create_user_error_resolvers`);
    expect(result.content).toContain(`export type create_user_ok_resolvers`);
    expect(result.content).toContain(`export type create_user_payload_resolvers`);
    expect(result.content).toContain(`export type error_type_resolvers`);
    expect(result.content).toContain(`export type mutation_resolvers`);
    expect(result.content).toContain(`export type node_resolvers`);
    expect(result.content).toContain(`export type post_resolvers`);
    expect(result.content).toContain(`export type query_resolvers`);
    expect(result.content).toContain(`export type user_resolvers`);

    expect(result.meta).toMatchInlineSnapshot(`
      Object {
        "generatedResolverTypes": Object {
          "resolversMap": Object {
            "name": "resolvers",
          },
          "userDefined": Object {
            "CreateUserError": Object {
              "name": "create_user_error_resolvers",
            },
            "CreateUserOk": Object {
              "name": "create_user_ok_resolvers",
            },
            "CreateUserPayload": Object {
              "name": "create_user_payload_resolvers",
            },
            "ErrorType": Object {
              "name": "error_type_resolvers",
            },
            "Mutation": Object {
              "name": "mutation_resolvers",
            },
            "Node": Object {
              "name": "node_resolvers",
            },
            "Post": Object {
              "name": "post_resolvers",
            },
            "Query": Object {
              "name": "query_resolvers",
            },
            "User": Object {
              "name": "user_resolvers",
            },
          },
        },
      }
    `);
  });
});
