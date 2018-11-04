import 'graphql-codegen-core/dist/testing';
import { introspectionToGraphQLSchema, makeExecutableSchema } from 'graphql-codegen-core';
import { readFileSync } from 'fs';
import { plugin } from '../dist';
import gql from 'graphql-tag';

describe('TypeScript Client', () => {
  const schema = introspectionToGraphQLSchema(JSON.parse(readFileSync('./tests/files/schema.json', 'utf-8')));

  it('Should compile simple Query correctly', async () => {
    const query = gql`
      query myFeed {
        feed {
          id
          commentCount
          repository {
            full_name
            html_url
            owner {
              avatar_url
            }
          }
        }
      }
    `;

    const content = await plugin(schema, [{ filePath: '', content: query }], {});

    expect(content).toBeSimilarStringTo(`
    export namespace MyFeed {
      export type Variables = {
      }
      export type Query = {
        __typename?: "Query";
        feed?: (Feed | null)[] | null;
      }
      export type Feed = {
        __typename?: "Entry";
        id: number; 
        commentCount: number; 
        repository: Repository; 
      }
      export type Repository = {
        __typename?: "Repository";
        full_name: string; 
        html_url: string; 
        owner?: Owner | null; 
      }
      export type Owner = {
        __typename?: "User";
        avatar_url: string; 
      }
    }
  `);
  });

  it('Should compile nested types', async () => {
    const testSchema = makeExecutableSchema({
      typeDefs: `
        type User {
          profile: Profile
          id: Int!
          favFriend: User
        }
        type Profile {
          name: String!
          email: String!
        }
        
        type Query {
          me: User
        }
      `
    });

    const query = gql`
      query me {
        me {
          id
          profile {
            name
          }
          favFriend {
            id
            profile {
              email
            }
            favFriend {
              id
              profile {
                email
              }
            }
          }
        }
      }
    `;

    const content = await plugin(testSchema, [{ filePath: '', content: query }], {});

    expect(content).toBeSimilarStringTo(`
      export namespace Me {
        export type Variables = {
        }

        export type Query = {
          __typename?: "Query";
          me?: Me | null;
        }

        export type Me = {
          __typename?: "User";
          id: number;
          profile?: Profile | null;
          favFriend?: FavFriend | null;
        }

        export type Profile = {
          __typename?: "Profile";
          name: string;
        }

        export type FavFriend = {
          __typename?: "User";
          id: number;
          profile?: _Profile | null;
          favFriend?: _FavFriend | null;
        }

        export type _Profile = {
          __typename?: "Profile";
          email: string;
        }
        
        export type _FavFriend = {
          __typename?: "User";
          id: number;
          profile?: __Profile | null;
        }
        
        export type __Profile = {
          __typename?: "Profile";
          email: string;
        }
      }`);
  });

  it('Should compile anonymous Query correctly', async () => {
    const query = gql`
      query {
        feed {
          id
          commentCount
          repository {
            full_name
            html_url
            owner {
              avatar_url
            }
          }
        }
      }
    `;

    const content = await plugin(schema, [{ filePath: '', content: query }], {});

    expect(content).toBeSimilarStringTo(`
    export namespace AnonymousQuery_1 {
      export type Variables = {
      }
      export type Query = {
        __typename?: "Query";
        feed?: (Feed | null)[] | null;
      }
      export type Feed = {
        __typename?: "Entry";
        id: number; 
        commentCount: number; 
        repository: Repository; 
      }
      export type Repository = {
        __typename?: "Repository";
        full_name: string; 
        html_url: string; 
        owner?: Owner | null; 
      }
      export type Owner = {
        __typename?: "User";
        avatar_url: string; 
      }
    }`);
  });
});
