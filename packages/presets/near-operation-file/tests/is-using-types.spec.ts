import { parse, buildSchema } from 'graphql';
import { isUsingTypes } from '../src/utils';

describe('isUsingTypes', () => {
  it('Should include fragments when they are not extenral', () => {
    const ast = parse(/* GraphQL */ `
      fragment UserFields on User {
        id
      }

      query user {
        ...UserFields
      }
    `);

    expect(isUsingTypes(ast, [], null)).toBeTruthy();
  });

  it('Should ignore fragments when they are extenral', () => {
    const ast = parse(/* GraphQL */ `
      fragment UserFields on User {
        id
      }

      query user {
        ...UserFields
      }
    `);

    expect(isUsingTypes(ast, ['UserFields'], null)).toBeFalsy();
  });

  it('Should includes types import when fragment spread is used over an optional field', () => {
    const schema = buildSchema(/* GraphQL */ `
      interface Node {
        id: ID!
      }

      type User implements Node {
        id: ID!
        login: String!
        name: String
      }

      type Query {
        user: User
      }
    `);
    const ast = parse(/* GraphQL */ `
      query getUser {
        user {
          ...user
        }
      }

      fragment user on User {
        id
      }
    `);

    expect(isUsingTypes(ast, ['user'], schema)).toBeTruthy();
  });

  it('Should includes types correctly', () => {
    const schema = buildSchema(/* GraphQL */ `
      type User {
        id: ID!
        profile: Profile
      }

      type Profile {
        name: String
      }

      type Query {
        user: User
      }
    `);
    const ast = parse(/* GraphQL */ `
      query getUser {
        user {
          id
          profile {
            name
          }
        }
      }
    `);

    expect(isUsingTypes(ast, ['user'], schema)).toBeTruthy();
  });

  it('Should includes types correctly when used in fragment', () => {
    const schema = buildSchema(/* GraphQL */ `
      interface Node {
        id: ID!
      }

      type User implements Node {
        id: ID!
        login: String!
        name: String

        pictures(limit: Int!): PictureConnection!
      }

      type PictureConnection {
        nodes: [Picture]!
      }

      type Picture {
        size: Int!
        url: String!
      }

      type Query {
        user: User
      }
    `);
    const ast = parse(/* GraphQL */ `
      fragment pictures on User {
        pictures(limit: 10) {
          nodes {
            ...picture
          }
        }
      }

      fragment picture on Picture {
        size
        url
      }
    `);

    expect(isUsingTypes(ast, ['picture'], schema)).toBeTruthy();
  });
});
