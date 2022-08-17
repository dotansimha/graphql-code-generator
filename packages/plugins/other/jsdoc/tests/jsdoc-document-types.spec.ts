import '@graphql-codegen/testing';
import { buildSchema, parse } from 'graphql';
import { plugin } from '../src/index.js';

describe('JSDoc Plugin', () => {
  describe('Document types', () => {
    it('should not contain an [object Object] when passing in a document', async () => {
      const document = parse(/* GraphQL */ `
        query getUser {
          users {
            id
          }
        }

        mutation updateUser($user: UserInput!) {
          id
        }
      `);

      const schema = buildSchema(/* Graphql */ `
                type Query {
                  users: [User!]!
                  user(id: ID!): User
                }

                # Describes the level of access a user has
                enum Role {
                  ADMIN
                  USER
                }

                # Represents a registered user
                type User {
                  # UUID of the user
                  id: ID!
                  # The user's name
                  name: String
                  # The user's level of access
                  role: Role!
                }

                input UserInput {
                    id: ID!
                    name: String
                    role: Role
                }

                fragment UserFields on User {
                    name
                    role
                }
            `);

      const config = {};
      const result = await plugin(schema, [{ location: '', document }], config, { outputFile: '' });

      expect(result).not.toEqual(expect.stringContaining('[object Object]'));
    });
  });
});
