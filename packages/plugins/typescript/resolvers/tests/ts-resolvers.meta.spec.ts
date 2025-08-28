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

        type TypeWithoutInterfaceOrUnion {
          id: ID!
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
        TypeWithoutInterfaceOrUnion?: type_without_interface_or_union_resolvers<ContextType>;
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
      {
        "generatedResolverTypes": {
          "resolversMap": {
            "name": "resolvers",
          },
          "userDefined": {
            "CreateUserError": {
              "hasIsTypeOf": true,
              "name": "create_user_error_resolvers",
            },
            "CreateUserOk": {
              "hasIsTypeOf": true,
              "name": "create_user_ok_resolvers",
            },
            "CreateUserPayload": {
              "hasIsTypeOf": false,
              "name": "create_user_payload_resolvers",
            },
            "ErrorType": {
              "hasIsTypeOf": false,
              "name": "error_type_resolvers",
            },
            "Mutation": {
              "hasIsTypeOf": false,
              "name": "mutation_resolvers",
            },
            "Node": {
              "hasIsTypeOf": false,
              "name": "node_resolvers",
            },
            "Post": {
              "hasIsTypeOf": true,
              "name": "post_resolvers",
            },
            "Query": {
              "hasIsTypeOf": false,
              "name": "query_resolvers",
            },
            "TypeWithoutInterfaceOrUnion": {
              "hasIsTypeOf": false,
              "name": "type_without_interface_or_union_resolvers",
            },
            "User": {
              "hasIsTypeOf": true,
              "name": "user_resolvers",
            },
          },
        },
      }
    `);
  });
});
