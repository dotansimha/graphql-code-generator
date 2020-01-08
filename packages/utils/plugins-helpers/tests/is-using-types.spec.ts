import { parse, buildSchema } from 'graphql';
import { isUsingTypes } from '../src/helpers';

describe('isUsingTypes', () => {
  describe('Issues', () => {
    it('#3217 - complex selection set causes issues with incorrect parent type', () => {
      const schema = buildSchema(/* GraphQL */ `
        type BrazilianCompany {
          _id: ID!
          ratings: [BrazilianCompanyRating!]!
          chiefExecutiveOfficer: String!
          financials: BrazilianCompanyFinancials!
        }

        type BrazilianCompanyFinancials {
          template: BrazilianCompanyFinancialsTemplate!
        }

        enum BrazilianCompanyFinancialsTemplate {
          BANK
          COMPANY
          INSURER
        }

        type GlassdoorRating {
          linkHref: String!
          overallRating: Float!
          reviewsCount: Int!
          recommendToFriend: Int!
          dateOfReference: String!
        }

        type ReclameAquiRating {
          linkHref: String!
          humanReadablePeriod: String
          classification: String
          score: Float
          formattedScore: String
        }

        union BrazilianCompanyRating = GlassdoorRating | ReclameAquiRating

        type Query {
          assetById(id: String!): Asset
        }

        union Asset = BrazilianCompany
      `);
      const ast = parse(/* GraphQL */ `
        query AssetById($id: String!) {
          assetById(id: $id) {
            __typename
            ... on BrazilianCompany {
              ...BrazilianCompanyTopLevel
            }
          }
        }

        fragment BrazilianCompanyTopLevel on BrazilianCompany {
          _id
          ratings {
            ... on ReclameAquiRating {
              linkHref
              humanReadablePeriod
              classification
              score
              formattedScore
            }
            ... on GlassdoorRating {
              linkHref
              overallRating
            }
          }
          chiefExecutiveOfficer
          financials {
            template
          }
        }
      `);

      expect(isUsingTypes(ast, [], schema)).toBeTruthy();
    });
  });

  it('Should work with __typename on fragments', () => {
    const schema = buildSchema(/* GraphQL */ `
      type Query {
        user(id: ID!): User!
      }

      type User {
        id: ID!
        username: String!
        email: String!
      }
    `);
    const ast = parse(/* GraphQL */ `
      fragment User on User {
        __typename
      }
    `);

    expect(isUsingTypes(ast, [], schema)).toBeFalsy();
  });

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
