import gql from 'graphql-tag';
import { GraphQLSchema } from 'graphql';
import * as fs from 'fs';
import { introspectionToGraphQLSchema } from '../src/utils/introspection-to-schema';
import { getRoot } from '../src/utils/get-root';

describe('getRoot', () => {
  let schema: GraphQLSchema;

  beforeAll(() => {
    schema = introspectionToGraphQLSchema(JSON.parse(fs.readFileSync('../../dev-test/githunt/schema.json').toString()));
  });

  it('should return root Query type', () => {
    const query = gql`
      query MyQuery {
        currentUser {
          login
          avatar_url
        }
      }
    `;

    const root = getRoot(schema, query.definitions[0]);
    expect(String(root)).toBe('Query');
  });

  it('should return root Mutation type', () => {
    const query = gql`
      mutation {
        currentUser {
          login
          avatar_url
        }
      }
    `;

    const root = getRoot(schema, query.definitions[0]);
    expect(String(root)).toBe('Mutation');
  });

  it('should return root Query type', () => {
    const query = gql`
      subscription {
        currentUser {
          login
          avatar_url
        }
      }
    `;

    const root = getRoot(schema, query.definitions[0]);
    expect(String(root)).toBe('Subscription');
  });

  it('should return null when invalid operation provided', () => {
    const query = gql`
      fragment f on User {
        login
        avatar_url
      }
    `;

    const root = getRoot(schema, query.definitions[0]);
    expect(root).toBe(null);
  });
});
